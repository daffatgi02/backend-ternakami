from flask import Flask, request, jsonify
import tensorflow as tf
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
from flask_cors import CORS
from werkzeug.exceptions import BadRequest
import logging
from datetime import datetime
from pytz import timezone

# Constants
MODEL_PATH = 'kambing_Modelvgg16.h5'
IMAGE_SIZE = (224, 224)
LABELS = {
    'kambing': {0: 'Mata Terjangkit PinkEye', 1: 'Mata Terlihat Sehat'},
}

# Flask app setup
app = Flask(__name__)
CORS(app)

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('backend-ml-ternakami-app')

# Utility function to get the current time in the Asia/Jakarta timezone
def get_current_time():
    time_format = "%Y-%m-%d-%H:%M:%S"
    tz = timezone('Asia/Jakarta')
    return datetime.now(tz).strftime(time_format)

# Load the TensorFlow model
model = load_model(MODEL_PATH)

@app.route('/', methods=['GET'])
def home():
    logger.info(f"{get_current_time()} - LOG STATUS: Service API Aktif")
    return 'Service API Aktif'

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        logger.info(f"{get_current_time()} - LOG STATUS: Received prediction request")

        animal_type = request.form.get('type')
        animal_name = request.form.get('Animal_Name')
        image_data = request.files.get('image')

        if not animal_type or not animal_name or not image_data:
            raise BadRequest('Error 400: No Image or Type or Animal_Name specified')

        image = Image.open(image_data).convert('RGB')
        image = image.resize(IMAGE_SIZE)
        data_input = np.expand_dims(np.array(image) / 255.0, axis=0).astype(np.float32)

        prediction = model.predict(data_input)
        predicted_class = np.argmax(prediction)
        confidence = prediction[0][predicted_class]

        label_prediction = LABELS.get(animal_type, {}).get(predicted_class, 'Hewan/Kelas Tidak Dikenal')

        response = {
            'Animal_Name': animal_name,
            'label_prediksi': label_prediction,
            'confidence': float(confidence)
        }

        logger.info(f"{get_current_time()} - LOG STATUS: Prediction successful")
        return jsonify(response)

    except Exception as e:
        logger.error(f"{get_current_time()} - LOG STATUS: Prediction failed - {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
