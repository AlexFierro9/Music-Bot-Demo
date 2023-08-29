from flask import Flask, jsonify, request
from flask_restful import Resource, Api
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from flask_cors import CORS


language_key = 'f95d6041f5504a4a815528f15bfac005'
language_endpoint = 'https://emotiondetector6978.cognitiveservices.azure.com/'




# Authenticate the client using your key and endpoint
def authenticate_client():
    ta_credential = AzureKeyCredential(language_key)
    text_analytics_client = TextAnalyticsClient(
        endpoint=language_endpoint,
        credential=ta_credential)
    return text_analytics_client


client = authenticate_client()


def sentiment_analysis(client, dialogue_history):
    result = client.analyze_sentiment(dialogue_history)
    result = [dialogue for dialogue in result if not dialogue.is_error]
    positive_reviews = [dialogue for dialogue in result if dialogue.sentiment == "positive"]
    negative_reviews = [dialogue for dialogue in result if dialogue.sentiment == "negative"]
    return "positive" if len(positive_reviews)>len(negative_reviews) else "negative"



tokenizer = AutoTokenizer.from_pretrained("microsoft/GODEL-v1_1-large-seq2seq")
model = AutoModelForSeq2SeqLM.from_pretrained("microsoft/GODEL-v1_1-large-seq2seq")

app = Flask(__name__)
api = Api(app)
CORS(app)

class ResponseResource(Resource):
    def post(self):
        data = request.get_json()

        instruction = data.get('instruction', '')
        knowledge = data.get('knowledge', '')
        dialog = data.get('dialog', [])
        instruction = f'Instruction: given a dialog context, you need to response empathically.'
        dialog_text = ' EOS '.join(dialog)
        query = f"{instruction} [CONTEXT] {dialog_text} {knowledge}"

        input_ids = tokenizer.encode(query, return_tensors="pt")
        output = model.generate(input_ids, max_length=16, min_length=2, top_p=0.1, do_sample=True)
        generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
        sentiment = sentiment_analysis(client, dialog)
        response_data = {'generated_response': generated_text,'sentiment':sentiment}
        return jsonify(response_data)
api.add_resource(ResponseResource,'/get_response')

if __name__ == '__main__':
    app.run(debug=True)
