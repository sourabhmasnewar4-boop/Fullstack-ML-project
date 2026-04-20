# Use Case Diagram

The system involves two primary actors: The User (Patient/Clinician) and the Admin.

```mermaid
usecaseDiagram
    actor User
    actor Admin
    
    package "Schizophrenia Detection System" {
        usecase "Login / Register" as UC1
        usecase "Input Text Data" as UC2
        usecase "Upload Audio Data" as UC3
        usecase "View Prediction Result" as UC4
        usecase "Download PDF Report" as UC5
        usecase "View Personal History" as UC6
        usecase "View Overall System Analytics" as UC7
        usecase "Manage Users" as UC8
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    Admin --> UC1
    Admin --> UC7
    Admin --> UC8
```
