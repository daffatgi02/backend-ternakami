import numpy as np
import tensorflow as tf
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def load_model_from_local(model_path):
    try:
        model = tf.lite.Interpreter(model_path=model_path)
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

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files or 'type' not in request.form:
        return jsonify({'error': 'No image or type specified'}), 400

    image_file = request.files['image']
    animal_type = request.form['type']
    model_path = f"./model_{animal_type}.tflite"

    try:
        image = Image.open(image_file)
        interpreter, input_details, output_details = load_model_from_local(model_path)
        predicted_class, probability = predict_image(image, interpreter, input_details, output_details, animal_type)
        result = {'class': predicted_class, 'probability': float(probability)}
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    return 'SERVICE API AKTIF'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
