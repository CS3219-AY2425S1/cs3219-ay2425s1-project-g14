FROM golang:1.20

WORKDIR /collab-service

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /collab-service/app

# Run
CMD ["/collab-service/app"]