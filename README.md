# WeDraw



## How build the both client and server sides for this App

```
╔══════════════════════╗        ╔═══════════╗ 
║ App.component.html.ts║-------➡║ index.html║-------
╚══════════════════════╝        ╚═══════════╝       |
    ↗         ↖                                     |
╔════════╗   ╔════════╗                             |
║ Navbar ║   ║ Router ║                             |
╚════════╝   ╚════════╝                             |
                  ↗    ↖                            |
╔══════════════════════╗ ╔═══════════════════════╗  |
║ ProblemListCompinent ║ ║ ProblemDetailComponent║  |
╚══════════════════════╝ ╚═══════════════════════╝  |
        ↗                ↘      ↓ onInit function   |
╔══════════════════════╗   ╔════════════╗           |
║  NewProblemCompinent ║ ➡ ║ DataService║           |
╚══════════════════════╝   ╚════════════╝           |
              (api Request)  ↑  ↓           ╔═══════════╗
-----------------------------↑  ↓ --------  ║public/    ║
                             ↑    ↘         ║ index.html║
                             ↑       ↘      ╚═══════════╝
╔══════════════╗     ╔═══════════╗    ↘    ↗  Index   
║ProblemService║ ↔↔↔ ║Rest Router║    ↓    ↑    Router
╚══════════════╝     ║  rest.js  ║   ╔═══════════╗
    ↓↑               ╚═══════════╝ ↖ ║ Server.js ║
    ↓↑                               ╚═══════════╝
    ↓↑                                     ║
╔══════════════╗      ╔══════════╗ connect ║ 
║ ProblemModel ║  ←←← ║ MongoDB  ║ ════════╝ 
╚══════════════╝      ╚══════════╝
```
***
## How a request was sent from frontend to backend and back to browser

- DataService(FrontEnd) call a Http Request 
- for example getProblems()
- api Request send to server.js 
- Server.js send request to RestRouter to find a right ProblemService
- Problem help to get data from ProblemSchema 
- ProblemModel search the data from Database and send back to RestRouter
- RestRouter get the problems data and chagne it to a JSON file
- Send it back to DataService
- Since problem-list have subscripted, the chagne will call to frontend angular cli
- By data binding with html, frontend contents change

***
## Dependencies
* Node.js
* MongoDB
* Angular2
* Nginx
* make

## Authors
Dixin Sun
