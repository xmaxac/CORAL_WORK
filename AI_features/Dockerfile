FROM tensorflow/serving:latest

WORKDIR /models/coralbase_serving

COPY ./models/new_models/1_ver /models/coralbase_serving

EXPOSE 8605

CMD ["tensorflow_model_server", "--rest_api_port=8605", "--model_name=1", "--model_base_path=/models/coralbase_serving"]
