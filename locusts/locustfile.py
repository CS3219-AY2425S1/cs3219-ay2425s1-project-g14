from locust import HttpUser, TaskSet, task, between

class UserBehavior(TaskSet):
    @task
    def load_homepage(self):
        self.client.get("/")

    # @task
    # def perform_action(self):
    #     # Add more endpoints or actions specific to your application.
    #     self.client.post("/auth/login", json={"username": "testuser", "password": "testpass"})

class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(1, 5)  # Wait between requests to simulate real usage
