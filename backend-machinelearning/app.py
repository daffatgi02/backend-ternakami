import uuid
import os
import numpy as np
import tensorflow as tf
from PIL import Image
from io import BytesIO
from flask import Flask, request, jsonify
from google.cloud import storage
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Menggunakan variabel lingkungan untuk konfigurasi
SERVICE_ACCOUNT_KEY_PATH = os.getenv('SERVICE_ACCOUNT_KEY_PATH', 'key.json')
BUCKET_NAME = os.getenv('BUCKET_NAME', 'appengine-cloudstorage')
IMAGE_FOLDER = os.getenv('IMAGE_FOLDER', 'image')

def load_model_from_gcs(service_account_key_path, model_blob):
    try:
        storage_client = storage.Client.from_service_account_json(service_account_key_path)
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(model_blob)
        model_content = blob.download_as_bytes()
        model = tf.lite.Interpreter(model_content=model_content)
        model.allocate_tensors()
        input_details = model.get_input_details()
        output_details = model.get_output_details()
        return model, input_details, output_details
    except Exception as e:
        raise RuntimeError(f"Error loading model: {e}")


def preprocess_image(image, input_shape):
    image = image.resize((input_shape[1], input_shape[2]))
    image = np.array(image)
    image = np.expand_dims(image, axis=0)
    image = image.astype(np.float32) / 255.0
    return image

def predict_image(image, interpreter, input_details, output_details, animal_type):
    input_shape = input_details[0]['shape']
    image = preprocess_image(image, input_shape)
    interpreter.set_tensor(input_details[0]['index'], image)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]['index'])
    
    if animal_type == "sapi":
        predicted_class = "Mata sapi kamu Terjangkit Penyakit Pinkeye" if output[0][0] < 0.5 else "Mata sapi kamu Sehat!"
    elif animal_type == "kambing":
        predicted_class = "Mata kambing kamu Terjangkit Penyakit Pinkeye" if output[0][0] < 0.5 else "Mata kambing kamu Sehat!"
    else:
        predicted_class = "Unknown Animal Type"
    
    probability = output[0][0]
    return predicted_class, probability


def upload_image_to_gcs(image):
    try:
        filename = str(uuid.uuid4()) + '.jpg'
        storage_client = storage.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH)
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(f"{IMAGE_FOLDER}/{filename}")
        image_bytes = BytesIO()
        image.save(image_bytes, format='JPEG')
        image_bytes.seek(0)
        blob.upload_from_file(image_bytes, content_type='image/jpeg')
        return blob.public_url
    except Exception as e:
        raise RuntimeError(f"Error uploading image: {e}")

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files or 'type' not in request.form:
        return jsonify({'error': 'No image or type specified'})

    image_file = request.files['image']
    animal_type = request.form['type']
    model_blob = f"model_{animal_type}.tflite"

    try:
        image = Image.open(image_file)
        interpreter, input_details, output_details = load_model_from_gcs(SERVICE_ACCOUNT_KEY_PATH, model_blob)
        image_url = upload_image_to_gcs(image)
        predicted_class, probability = predict_image(image, interpreter, input_details, output_details, animal_type)
        result = {'class': predicted_class, 'probability': float(probability), 'image_url': image_url}
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})


@app.route('/', methods=['GET'])
def api_status():
    return jsonify({'message': 'API is active'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
