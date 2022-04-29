class Place {
  constructor(title, imageUri, address, location) {
    this.title = title
    this.imageUri = imageUri
    this.location = location // { lat: 51553, lon: tetew }
    this.id = new Date().toString() + Math.random().toString()
  }
}