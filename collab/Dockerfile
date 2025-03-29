FROM golang:1.20

WORKDIR /collab

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /collab/app

EXPOSE 4000

# Run
CMD ["/collab/app"]