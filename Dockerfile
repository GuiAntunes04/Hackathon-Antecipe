FROM node:20-alpine AS front-css

WORKDIR /build
COPY package.json tailwind.config.js ./
COPY app/static ./app/static
RUN npm install && npm run build:css

FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY --from=front-css /build/app/static/css/tailwind.css ./app/static/css/tailwind.css
COPY config ./config
COPY scripts ./scripts
COPY cnpj_situacao_mock.csv ./cnpj_situacao_mock.csv
COPY estoque_antecipe.csv ./estoque_antecipe.csv
COPY resultado_esperado_100k.json ./resultado_esperado_100k.json
COPY data ./data
COPY tests ./tests
COPY pytest.ini .

EXPOSE 8000

CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "8000"]
