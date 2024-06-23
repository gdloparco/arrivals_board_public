package flights

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

var requestCounts = make(map[string]int)

func init() {
	go resetRequestCountsEvery30Minutes()
}

func resetRequestCountsEvery30Minutes() {
	for {
		now := time.Now()
		next := now.Add(30 * time.Minute)
		next = time.Date(next.Year(), next.Month(), next.Day(), next.Hour(), next.Minute()/30*30, 0, 0, next.Location())
		t := time.NewTimer(next.Sub(now))
		<-t.C
		requestCounts = make(map[string]int)
	}
}

func ReadFromAPI(ApiURL string, password string) (ArrivalsData, error) {
	currentDate := time.Now().Format("2006-01-02")

	if requestCounts[currentDate] >= 4 {

		message := struct {
			Message string `json:"message"`
		}{
			Message: "Request limit reached. Please try again in 15 minutes.",
		}
		jsonMessage, _ := json.Marshal(message)
		return ArrivalsData{}, fmt.Errorf("%s", jsonMessage)
	}
	requestCounts[currentDate]++

	req, err := http.NewRequest("GET", ApiURL, nil)
	if err != nil {
		fmt.Println("Error creating request:", err)
	}
	req.Header.Set("x-apikey", password)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making request:", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
	}

	var ArrivalsData ArrivalsData

	err = json.Unmarshal(body, &ArrivalsData)
	if err != nil {
		fmt.Println("Error unmarshaling JSON:", err)
	}

	return ArrivalsData, nil
}