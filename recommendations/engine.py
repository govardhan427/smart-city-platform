import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from events.models import Event, Registration
from facilities.models import Facility, Booking

def get_event_recommendations(user_id, top_n=3):
    """
    Returns a list of Event objects recommended for the specific user.
    """
    
    # 1. GET USER'S LAST INTERACTION
    last_registration = Registration.objects.filter(user_id=user_id).order_by('-registered_at').first()
    
    # --- COLD START: No history? Return latest events ---
    if not last_registration:
        return list(Event.objects.order_by('-created_at')[:top_n])

    target_event_id = last_registration.event.id

    # 2. FETCH ALL EVENTS
    # Optimization: Fetch all events once and create a lookup dictionary
    # This prevents hitting the DB again later
    all_events = list(Event.objects.all())
    event_map = {e.id: e for e in all_events}

    # 3. PREPARE DATA FOR ML
    data = []
    for event in all_events:
        # Combine text fields to create a "soup" of metadata
        soup = f"{event.title} {event.description} {event.location}"
        data.append({
            'id': event.id,
            'content': soup
        })
    
    df = pd.DataFrame(data)
    
    # Safety Check: Need at least 2 events to compare
    if len(df) < 2:
        return list(Event.objects.exclude(id=target_event_id)[:top_n])

    # 4. VECTORIZATION & SIMILARITY
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['content'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # 5. FIND TARGET & SCORE
    indices = pd.Series(df.index, index=df['id']).drop_duplicates()
    
    if target_event_id not in indices:
        return list(Event.objects.order_by('-created_at')[:top_n])

    idx = indices[target_event_id]

    # Get scores for the target event
    sim_scores = list(enumerate(cosine_sim[idx]))
    
    # Sort by score (Highest first)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Slice top N (Skip index 0 because it's the event itself)
    sim_scores = sim_scores[1:top_n+1]
    
    # 6. RETRIEVE OBJECTS
    event_indices = [i[0] for i in sim_scores]
    recommended_ids = df['id'].iloc[event_indices].tolist()
    
    # Optimization: Retrieve from our existing memory map
    recommended_events = [event_map[rid] for rid in recommended_ids if rid in event_map]
        
    return recommended_events
def get_facility_recommendations(user_id, top_n=3):
    """
    Returns a list of Facility objects recommended based on last booking.
    """
    
    # 1. GET USER'S LAST BOOKING
    # We look at the most recent booking to determine current interest
    last_booking = Booking.objects.filter(user_id=user_id).order_by('-created_at').first()
    
    # --- COLD START ---
    if not last_booking:
        # Return random or first 3 facilities if no history
        return list(Facility.objects.all()[:top_n])

    target_id = last_booking.facility.id

    # 2. FETCH ALL DATA
    all_facilities = list(Facility.objects.all())
    fac_map = {f.id: f for f in all_facilities}

    # 3. PREPARE TEXT SOUP
    data = []
    for fac in all_facilities:
        # Combine Name + Description + Location
        soup = f"{fac.name} {fac.description} {fac.location}"
        data.append({'id': fac.id, 'content': soup})
    
    df = pd.DataFrame(data)

    # Safety Check
    if len(df) < 2:
        return list(Facility.objects.exclude(id=target_id)[:top_n])

    # 4. ML MAGIC (TF-IDF + Cosine Similarity)
    tfidf = TfidfVectorizer(stop_words='english')
    matrix = tfidf.fit_transform(df['content'])
    cosine_sim = cosine_similarity(matrix, matrix)

    # 5. FIND SIMILAR
    indices = pd.Series(df.index, index=df['id']).drop_duplicates()
    
    if target_id not in indices:
        return list(Facility.objects.all()[:top_n])

    idx = indices[target_id]
    
    # Get scores
    scores = list(enumerate(cosine_sim[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    scores = scores[1:top_n+1] # Skip self

    # 6. RETRIEVE OBJECTS
    result_ids = [df['id'].iloc[i[0]] for i in scores]
    return [fac_map[rid] for rid in result_ids if rid in fac_map]