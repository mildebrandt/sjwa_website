# SJWA website

This is the website for the San Jose Woodworkers Association.

## Encrypt roster

The roster is an encrypted CSV file. To update the roster, do the following:

1. Open the current roster in Google Sheets and switch to the "Roster for export" sheet.
1. Download as CSV from the File->Download menu.
1. Encrypt file using the command below. You'll be asked to enter the password twice.
    ```
    openssl enc -aes-256-cbc -md md5 -salt -in '2026 Roster San José Wood Workers - Roster for export.csv' -out encrypted_roster.txt -a -A
    ```
1. Update and commit the new file.
