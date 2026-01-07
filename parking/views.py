import joblib
import os
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

# Point to the same folder as the training script
# Ensure this matches your app structure (e.g., 'transport' or 'parking')
MODEL_PATH = os.path.join(settings.BASE_DIR, 'transport/parking_model.pkl')

# Load model once at server startup
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ AI Model loaded from {MODEL_PATH}")
except Exception as e:
    model = None
    print(f"⚠️ Warning: Model not found at {MODEL_PATH}. Run train_model.py.")

class ParkingPredictView(APIView):
    """
    POST /api/transport/predict/
    Body: { "datetime": "2026-10-25T18:00:00" }
    """
    
    def post(self, request):
        if not model:
            return Response({"error": "AI Model is offline."}, status=503)

        date_str = request.data.get('datetime')
        if not date_str:
            return Response({"error": "datetime is required"}, status=400)

        try:
            # 1. Parse Input
            dt = datetime.fromisoformat(date_str.replace("Z", ""))
            
            # 2. Extract Features (Must match training order!)
            day_of_week = dt.weekday()
            hour = dt.hour
            is_weekend = 1 if day_of_week >= 5 else 0
            
            # 3. Predict
            # scikit-learn expects a 2D array [[f1, f2, f3]]
            features = [[day_of_week, hour, is_weekend]]
            prediction = model.predict(features)[0]
            
            # 4. Interpret Result
            occupancy = round(prediction)
            level = "Low"
            if occupancy > 85: level = "Critical"
            elif occupancy > 60: level = "High"
            elif occupancy > 30: level = "Moderate"

            return Response({
                "predicted_occupancy": occupancy,
                "level": level,
                "hour": hour,
                "is_weekend": bool(is_weekend)
            })

        except Exception as e:
            return Response({"error": str(e)}, status=400)