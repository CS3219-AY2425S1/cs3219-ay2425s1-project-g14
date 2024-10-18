FROM golang:1.23

WORKDIR /matching-service-api

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /matching-service-api/app

EXPOSE 9200

# Run
CMD ["/matching-service-api/app"]