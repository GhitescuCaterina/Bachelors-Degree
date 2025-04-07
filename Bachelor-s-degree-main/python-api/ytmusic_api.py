from fastapi import FastAPI
from ytmusicapi import YTMusic, OAuthCredentials

app = FastAPI()

try:
    ytmusic = YTMusic(
        "oauth.json",
        oauth_credentials=OAuthCredentials(
            client_id="184264515134-7pcrfliqaue70o0ff347mp7ssr6j7c98.apps.googleusercontent.com",
            client_secret="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"
        )
    )
except Exception as e:
    print("Eroare la încărcarea fișierului de autentificare:", e)
    ytmusic = None

@app.get("/")
def read_root():
    return {"message": "YTMusic API Microservice Running"}

@app.get("/playlists")
def get_playlists():
    if not ytmusic:
        return {"error": "YTMusic API not initialized properly"}
    try:
        playlists = ytmusic.get_library_playlists(limit=None)
        return {"playlists": playlists}
    except Exception as e:
        return {"error": f"Eroare la preluarea playlisturilor: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
