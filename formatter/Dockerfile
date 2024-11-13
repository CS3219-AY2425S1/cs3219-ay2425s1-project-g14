FROM alpine:latest

RUN apk add --no-cache clang clang-extra-tools python3 py3-pip nodejs npm
RUN python3 -m venv /src/.venv
RUN /src/.venv/bin/pip install black fastapi uvicorn
RUN npm install -g prettier esprima
ENV PATH="/src/.venv/bin:$PATH"
WORKDIR /src
COPY src /src
EXPOSE 5000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
