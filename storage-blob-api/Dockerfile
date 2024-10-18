FROM golang:1.23

WORKDIR /storage-blob-api

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /storage-blob-api/app

EXPOSE 9300

# Run
CMD ["/storage-blob-api/app"]