import uuid
import os
import numpy as np
import tensorflow as tf
from PIL import Image
from io import BytesIO
from flask import Flask, request, jsonify
from google.cloud import storage

app = Flask(__name__)

# Key JSON Google service account
service_account_key_path = 'key.json'
model_bucket = 'appengine-cloudstorage'

def load_model_from_gcs(model_blob):
    storage_client = storage.Client.from_service_account_json(service_account_key_path)
    bucket = storage_client.bucket(model_bucket)
    blob = bucket.blob(model_blob)
    model_content = blob.download_as_bytes()  # Download as binary data
    model = tf.lite.Interpreter(model_content=model_content)
    model.allocate_tensors()
    input_details = model.get_input_details()
    output_details = model.get_output_details()
    return model, input_details, output_details

def preprocess_image(image, input_shape):
    image = image.resize((input_shape[1], input_shape[2]))
    image = np.array(image)
    image = np.expand_dims(image, axis=0)
    image = image.astype(np.float32) / 255.0
    return image

def predict_image(image, interpreter, input_details, output_details):
    input_shape = input_details[0]['shape']
    image = preprocess_image(image, input_shape)
    interpreter.set_tensor(input_details[0]['index'], image)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]['index'])
    predicted_class = "Mata Terjangkit Penyakit Pinkeye" if output[0][0] < 0.5 else "Mata Hewan Kamu Sehat!"
    probability = output[0][0]
    return predicted_class, probability

def upload_image_to_gcs(image, bucket_name, image_folder):
    filename = str(uuid.uuid4()) + '.jpg'
    storage_client = storage.Client.from_service_account_json(service_account_key_path)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(f"{image_folder}/{filename}")
    image_bytes = BytesIO()
    image.save(image_bytes, format='JPEG')
    image_bytes.seek(0)
    blob.upload_from_file(image_bytes, content_type='image/jpeg')
    return blob.public_url

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            response = jsonify({'error': 'No image uploaded'})
            response.status_code = 400  # Bad Request
            return response

        image_file = request.files['image']
        image = Image.open(image_file)

        model_blob = 'model_sapi.tflite'  # Change this to 'model_kambing.tflite' for the kambing model

        interpreter, input_details, output_details = load_model_from_gcs(model_blob)

        image_url = upload_image_to_gcs(image, model_bucket, 'image')

        predicted_class, probability = predict_image(image, interpreter, input_details, output_details)

        result = {'class': predicted_class, 'probability': float(probability), 'image_url': image_url}
        return jsonify(result), 200  # Status code 200 for success
    except Exception as e:
        response = jsonify({'error': 'Terjadi Kesalahan di server'})
        response.status_code = 500  # Internal Server Error
        return response
        
@app.route('/', methods=['GET'])
def api_status():
    return jsonify({'message': 'API is active'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
