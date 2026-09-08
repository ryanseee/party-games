# Use an official Node runtime as a parent image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /frontend

# Copy the current directory contents into the container at /app
COPY . /frontend

# Install any needed packages specified in package.json
RUN npm install

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run app.js when the container launches
CMD ["npm", "run", "dev"]