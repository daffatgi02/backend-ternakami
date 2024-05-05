import numpy as np
import tensorflow as tf
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import logging
from datetime import datetime
import pytz

app = Flask(__name__)
CORS(app)

# Initialize cache for models
model_cache = {}

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FlaskAPI")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - [%(ip)s][%(message)s]')
handler.setFormatter(formatter)
logger.addHandler(handler)

def get_client_ip():
    if request.headers.get('X-Forwarded-For'):
        return request.headers['X-Forwarded-For'].split(',')[0]
    return request.remote_addr

def load_model_from_local(model_path):
    if model_path not in model_cache:
        try:
            model = tf.lite.Interpreter(model_path=model_path)
            model.allocate_tensors()
            input_details = model.get_input_details()
            output_details = model.get_output_details()
            model_cache[model_path] = (model, input_details, output_details)
        except Exception as e:
            raise RuntimeError(f"Error loading model: {e}")
    return model_cache[model_path]

def preprocess_image(image, input_shape):
    image = image.resize((input_shape[1], input_shape[2]))
    image = np.array(image)
    image = np.expand_dims(image, axis=0)
    image = image.astype(np.float32) / 255.0
    return image

@app.route('/api/predict', methods=['POST'])
def predict():
    client_ip = get_client_ip()
    tz = pytz.timezone('Asia/Jakarta')
    datetime.now(tz).strftime("%Y-%m-%d-%H-%M-%S")
    try:
        if 'image' not in request.files or 'type' not in request.form:
            return jsonify({'error': 'No image or type specified'}), 400

        image_file = request.files['image']
        if image_file.mimetype not in ['image/jpeg', 'image/png']:
            return jsonify({'error': 'Unsupported file type'}), 422

        if image_file.content_length > 5 * 1024 * 1024:
            return jsonify({'error': 'File size limit exceeded'}), 413

        animal_type = request.form['type']
        model_path = f"./model_{animal_type}.tflite"

        interpreter, input_details, output_details = load_model_from_local(model_path)
        image = Image.open(image_file)
        predicted_class, probability = predict_image(image, interpreter, input_details, output_details, animal_type)
        result = {'class': predicted_class, 'probability': float(probability)}
        logger.info('Prediction successful', extra={'ip': client_ip, 'custom_message': 'Prediction successful'})
        return jsonify(result), 200
    except FileNotFoundError:
        logger.error('Model not found', extra={'ip': client_ip, 'custom_message': 'Model not found'})
        return jsonify({'error': 'Model not found for the specified type'}), 404
    except Exception as e:
        logger.error(f'Prediction error: {str(e)}', extra={'ip': client_ip, 'custom_message': str(e)})
        return jsonify({'error': 'Server error occurred'}), 500

def predict_image(image, interpreter, input_details, output_details, animal_type):
    input_shape = input_details[0]['shape']
    image = preprocess_image(image, input_shape)
    interpreter.set_tensor(input_details[0]['index'], image)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]['index'])

    if animal_type == "sapi":
        predicted_class = "Mata Sapi Terjangkit Penyakit Pinkeye" if output[0][0] < 0.5 else "Mata Sapi Sehat!"
    elif animal_type == "kambing":
        predicted_class = "Mata Kambing Terjangkit Penyakit Pinkeye" if output[0][0] < 0.5 else "Mata Kambing Sehat!"
    else:
        predicted_class = "Unknown Animal Type"

    probability = output[0][0]
    return predicted_class, probability

@app.route('/')
def index():
    return 'SERVICE API AKTIF'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
