from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from events.models import Event, Registration
from facilities.models import Facility, Booking  # Adjusted import based on your app name

# --- EVENTS ENGINE ---
def get_event_recommendations(user_id, top_n=3):
    """
    Returns a list of Event objects recommended for the specific user.
    Uses pure Python lists (No Pandas) for Vercel compatibility.
    """
    
    # 1. GET USER'S LAST INTERACTION
    last_registration = Registration.objects.filter(user_id=user_id).order_by('-registered_at').first()
    
    # --- COLD START: No history? Return latest events ---
    if not last_registration:
        return list(Event.objects.order_by('-created_at')[:top_n])

    target_event_id = last_registration.event.id

    # 2. FETCH ALL EVENTS
    all_events = list(Event.objects.all())
    event_map = {e.id: e for e in all_events}

    # 3. PREPARE DATA FOR ML (Using Lists instead of DataFrame)
    data_content = []
    data_ids = []
    
    for event in all_events:
        # Combine text fields to create a "soup" of metadata
        soup = f"{event.title} {event.description} {event.location}"
        data_content.append(soup)
        data_ids.append(event.id)
    
    # Safety Check: Need at least 2 events to compare
    if len(data_ids) < 2:
        return list(Event.objects.exclude(id=target_event_id)[:top_n])

    # 4. VECTORIZATION & SIMILARITY
    tfidf = TfidfVectorizer(stop_words='english')
    # scikit-learn accepts simple lists of strings perfectly fine
    tfidf_matrix = tfidf.fit_transform(data_content)
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # 5. FIND TARGET INDEX
    try:
        # Find the index of our target ID in the list
        idx = data_ids.index(target_event_id)
    except ValueError:
        # Fallback if event deleted or not found
        return list(Event.objects.order_by('-created_at')[:top_n])

    # 6. SCORE AND SORT
    # Get scores for the target event
    sim_scores = list(enumerate(cosine_sim[idx]))
    
    # Sort by score (Highest first)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Slice top N (Skip index 0 because it's the event itself)
    sim_scores = sim_scores[1:top_n+1]
    
    # 7. RETRIEVE OBJECTS
    recommended_events = []
    for i, score in sim_scores:
        event_id = data_ids[i]
        if event_id in event_map:
            recommended_events.append(event_map[event_id])
            
    return recommended_events


# --- FACILITIES ENGINE ---
def get_facility_recommendations(user_id, top_n=3):
    """
    Returns a list of Facility objects recommended based on last booking.
    Uses pure Python lists (No Pandas) for Vercel compatibility.
    """
    
    # 1. GET USER'S LAST BOOKING
    last_booking = Booking.objects.filter(user_id=user_id).order_by('-created_at').first()
    
    # --- COLD START ---
    if not last_booking:
        return list(Facility.objects.all()[:top_n])

    target_id = last_booking.facility.id

    # 2. FETCH ALL DATA
    all_facilities = list(Facility.objects.all())
    fac_map = {f.id: f for f in all_facilities}

    # 3. PREPARE TEXT SOUP
    data_content = []
    data_ids = []

    for fac in all_facilities:
        soup = f"{fac.name} {fac.description} {fac.location}"
        data_content.append(soup)
        data_ids.append(fac.id)
    
    # Safety Check
    if len(data_ids) < 2:
        return list(Facility.objects.exclude(id=target_id)[:top_n])

    # 4. ML MAGIC
    tfidf = TfidfVectorizer(stop_words='english')
    matrix = tfidf.fit_transform(data_content)
    cosine_sim = cosine_similarity(matrix, matrix)

    # 5. FIND SIMILAR
    try:
        idx = data_ids.index(target_id)
    except ValueError:
        return list(Facility.objects.all()[:top_n])
    
    # Get scores
    scores = list(enumerate(cosine_sim[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    scores = scores[1:top_n+1] # Skip self

    # 6. RETRIEVE OBJECTS
    recommended = []
    for i, score in scores:
        fac_id = data_ids[i]
        if fac_id in fac_map:
            recommended.append(fac_map[fac_id])

    return recommended