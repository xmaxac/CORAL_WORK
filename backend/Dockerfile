# Use an official Node.js runtime as a parent image
FROM node:18.17.1-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY ./ /app/

# Install any needed packages specified in package.json
RUN npm install

# Make port 4000 available to the world outside this container
EXPOSE 4000

# Command to run the application
CMD ["sh", "-c", "node server.js"]
