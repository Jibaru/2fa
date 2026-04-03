package core

type Entry struct {
	ID     string `json:"id"`
	Issuer string `json:"issuer"`
	Name   string `json:"name"`
	Secret string `json:"secret"`
}

type EntryWithCode struct {
	ID        string `json:"id"`
	Issuer    string `json:"issuer"`
	Name      string `json:"name"`
	Code      string `json:"code"`
	Remaining int    `json:"remaining"`
	Period    int    `json:"period"`
}
