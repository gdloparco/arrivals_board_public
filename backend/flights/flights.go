package flights

type ArrivalsData struct {
	ArrivalsList []ArrivalFlight `json:"arrivals"`
}

type ArrivalFlight struct {
	Cancelled    bool        `json:"cancelled"`
	FlightNumber string      `json:"ident_iata"`
	Scheduled    string      `json:"scheduled_in"`
	Estimated    string      `json:"estimated_in"`
	Actual       string      `json:"actual_in"`
	Destination  Destination `json:"destination"`
	Origin       Origin      `json:"origin"`
}

type Origin struct {
	OriginAirportIATA string `json:"code_iata"`
	OriginCity        string `json:"city"`
	OriginAirportName string `json:"name"`
}

type Destination struct {
	DestinationAirportIATA string `json:"code_iata"`
	DestinationCity        string `json:"city"`
	DestinationAirportName string `json:"name"`
	Timezone               string `json:"timezone"`
}
