FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY config ./config
COPY scripts ./scripts
COPY cnpj_situacao_mock.csv ./cnpj_situacao_mock.csv
COPY estoque_antecipe.csv ./estoque_antecipe.csv
COPY data ./data
COPY tests ./tests
COPY pytest.ini .

RUN python scripts/mesclar_situacao_sacados.py \
    --mock cnpj_situacao_mock.csv \
    --csv estoque_antecipe.csv \
    --saida data/situacao_sacados.csv

EXPOSE 8000

CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "8000"]
