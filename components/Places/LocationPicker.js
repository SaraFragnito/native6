import { View, Text, StyleSheet, Alert, Image } from "react-native"
import { useState, useEffect } from "react"
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native"
import { getCurrentPositionAsync, useForegroundPermissions, PermissionStatus } from "expo-location"
import OutlinedButton from "../ui/OutlinedButton"
import { Colors } from "../../constants/colors"
import { getAddress, getMapPreview } from "../../util/location"

function LocationPicker({onPickLocation}){
  const [pickedLocation, setPickedLocation] = useState()
  const [locationPermissionInformation, requestPermission] = useForegroundPermissions()
  const navigation = useNavigation()
  const route = useRoute()
  const isFocused = useIsFocused()
  
  useEffect(() => {
    if (isFocused && route.params){
      const mapPickedLocation = route.params && { lat: route.params.pickedLat, lng: route.params.pickedLng }
      setPickedLocation(mapPickedLocation)
    }
  }, [route, isFocused])

  useEffect(() => {
    async function handleLocation(){
      if(pickedLocation){
        const address = await getAddress(pickedLocation.lat, pickedLocation.lng)
        onPickLocation({...pickedLocation, address: address})
      }
    }
    handleLocation()
  }, [pickedLocation, onPickLocation, getAddress])

  async function verifyPermissions(){
    if (locationPermissionInformation.status === PermissionStatus.UNDETERMINED){
      const permissionResponse = await requestPermission()
      return permissionResponse.granted
    }

    if (locationPermissionInformation.status === PermissionStatus.DENIED){
      Alert.alert("Insufficient Permissions!", "You need to grant location permissions to use this app.")
      return false
    }
    return true
  }
  
  async function getLocationHandler(){
    const hasPermission = await verifyPermissions()
    if (!hasPermission) return;
    
    const location = await getCurrentPositionAsync()
    setPickedLocation({
      lat: location.coords.latitude,
      lng: location.coords.longitude
    })
  }

  const pickOnMapHandler = () => navigation.navigate("Map")

  let locationPreview = <Text>No location picked yet.</Text>

  if (pickedLocation) locationPreview = <Image style={styles.image} source={{uri: getMapPreview(pickedLocation.lat, pickedLocation.lng)}} />
  
  return (
      <View>
        <View style={styles.mapPreview}>
          {locationPreview}
        </View>
        <View style={styles.actions}>
          <OutlinedButton onPress={getLocationHandler} icon="location">Locate User</OutlinedButton>
          <OutlinedButton onPress={pickOnMapHandler} icon="map">Pick on Map</OutlinedButton>
        </View>
      </View>
  )
}

export default LocationPicker

const styles = StyleSheet.create({
  mapPreview: {
    width: "100%",
    height: 200,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary100,
    borderRadius: 4,
    overflow: "hidden"
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  image: {
    width: "100%",
    height: "100%"
  }
})