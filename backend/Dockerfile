FROM python:3.12-slim
LABEL maintainer="jared.kortje"

WORKDIR /app

# Install deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# SQLite data dir
RUN mkdir -p /data && chown -R nobody /data

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
