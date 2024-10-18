FROM golang:1.23

WORKDIR /matching-service

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /matching-service/app

# Run
CMD ["/matching-service/app"]