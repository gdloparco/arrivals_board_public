package main

import (
	"encoding/json"
	"go.project/arrivals/flights"
	"net/http"
	"os"
	"strings"
)

func main() {
	http.HandleFunc("/flights", handleFlightsRequest)
	http.ListenAndServe(":8080", addCORSHeaders(http.DefaultServeMux))
}

func handleFlightsRequest(w http.ResponseWriter, r *http.Request) {
	airportCode := r.URL.Query().Get("airport_code")
	if airportCode == "" {
		http.Error(w, "No Airport IATA CODE provided. Please provide an IATA CODE.", http.StatusBadRequest)
		return
	}
	if len(airportCode) < 3 {
		http.Error(w, "Invalid Airport IATA CODE. IATA CODEs are composed of three letters.", http.StatusBadRequest)
		return
	}

	password := os.Getenv("FLIGHTAWARE_API_KEY")
	if password == "" {
		http.Error(w, "FlightAware API key not found.", http.StatusInternalServerError)
		return
	}

	apiURL := "https://aeroapi.flightaware.com/aeroapi//airports/" + strings.ToUpper(airportCode) + "/flights"
	arrivalsData, err := flights.ReadFromAPI(apiURL, password)
	if err != nil {
		if strings.Contains(err.Error(), "Request limit reached") {
			http.Error(w, "Request limit reached. Please try again in 15 minutes.", http.StatusTooManyRequests)
		} else {
			http.Error(w, "Failed to fetch flight data from the API.", http.StatusInternalServerError)
		}
		return
	}

	filteredFlights := filterFlights(arrivalsData.ArrivalsList)

	// Return the result as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(filteredFlights)
}

func filterFlights(arrivals []flights.ArrivalFlight) []flights.ArrivalFlight {
	filteredFlights := make([]flights.ArrivalFlight, 0)
	for _, flight := range arrivals {
		if flight.FlightNumber != "" && flight.Scheduled != "" {
			filteredFlights = append(filteredFlights, flight)
		}
	}
	return filteredFlights
}

func addCORSHeaders(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		handler.ServeHTTP(w, r)
	})
}
