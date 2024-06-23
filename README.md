# Arrivals Board Project

This project consists of a frontend and a backend to display live arrivals board flight status. The frontend fetches and displays data, while the backend handles API requests to retrieve flight information.

## Features

- **Live Data Fetching**: Fetches and displays live flight data based on the airport IATA code entered by the user.
- **Error Handling**: Provides user-friendly error messages for invalid inputs or failed API requests.
- **CORS Handling**: Backend includes CORS headers to allow cross-origin requests from the frontend.

## Technologies Used

### Frontend:
- JavaScript
- Moment Timezone
- HTML/CSS

### Backend:
- Go
- Standard Library for HTTP handling

### Usage

- **Frontend**: Enter a valid three-letter airport IATA code (e.g., LHR, JFK) into the input field and click "Get Live Flights". The arrivals board will display the latest flight information for the specified airport.

- **Backend**: The backend server listens for requests at /flights and expects an airport_code query parameter. It fetches flight data from the FlightAware API and returns it as JSON.

## Project Structure

- **Frontend**

*index.html*: HTML file defining the structure of the web page and importing necessary styles and scripts.

*style.css*: CSS file for styling the HTML elements.

*script.js*: JavaScript file responsible for fetching data from the API, handling user input, and updating the UI dynamically.

- **Backend**

*main.go*: Main Go file containing the HTTP server setup and request handling logic.

*flights/*: Directory containing the logic for interacting with the FlightAware API.

## Error Handling

- **Invalid IATA Code**: The frontend validates the IATA code and displays an error message if it's invalid.

- **API Errors**: The backend handles errors from the FlightAware API and returns appropriate HTTP status codes and error messages.
