# Notes Features

![image](https://github.com/user-attachments/assets/5dec78fe-c1a9-4b85-aee6-6b8e40fe7be1)

## Simple Note taking and sharing app
![image](https://github.com/user-attachments/assets/8d2887d2-0514-42fc-ba41-62c086fcbe8a)

![image](https://github.com/user-attachments/assets/d1b1ee2f-54f6-4d89-bcfd-a68000d0b497)

## Edit you note
![image](https://github.com/user-attachments/assets/0f455aaf-d276-4991-9824-38724251015c)

## Manage visibility
![image](https://github.com/user-attachments/assets/402486d7-b30f-4ff0-a368-1cf8a7cc4b9e)

![image](https://github.com/user-attachments/assets/8cca3cbf-e572-4171-818c-a922809b3589)

- share this link with anyone

## Comments [ users can comment and reply on the note/post ]
![image](https://github.com/user-attachments/assets/8ed23ad9-8122-407b-8e29-40866b236f01)

## User Profile

- you can click on the userName for any public shared notes and all the public notes from that user will be available 
![image](https://github.com/user-attachments/assets/1faf0e6d-2be5-4c16-891d-3ecd568ea21c)


# Setup 

- Fork the repository
- Add the .env.local

```
NEXTAUTH_SECRET=
NEXTAUTH_URL= <deployed-domain> or localhost:3000 for local dev
DATABASE_URL= <prisma-db-connection>
DIRECT_URL= <prisma-db-connection>
GOOGLE_CLIENT_ID= <oauth-creds>
GOOGLE_CLIENT_SECRET=  <oauth-creds>
GITHUB_ID=  <oauth-creds>
GITHUB_SECRET=  <oauth-creds>
```
- run migrations on db
- build and deploy on any preferred cloud service 

## Vercel setting override
![image](https://github.com/user-attachments/assets/c72651cb-e6e9-4149-a260-06139fce4d0b)


## Note
- FYI:  DB currently hosted on superbase so sometimes it pauses the access when db remain in-active. But the project will work just fine in your local or if you deploy it.

