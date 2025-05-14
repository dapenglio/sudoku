# Use official Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy server code into the container
COPY . /app

# Expose port 9888
EXPOSE 9888

# Default command to run the server
CMD ["python", "HausKVServer.py"]
