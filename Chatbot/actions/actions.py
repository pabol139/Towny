from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker, FormValidationAction
from rasa_sdk.events import SlotSet
from rasa_sdk.executor import CollectingDispatcher

from yattag import Doc

import requests
import json



class ActionHelloWorld(Action):

    def name(self) -> Text:
        return "action_weather"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        city = tracker.get_slot('ciudad')
        Final_url = "http://api.openweathermap.org/data/2.5/weather?appid=2d10225de67f0bde0facc3ef3e7307fe&q="+city+"&units=metric"    
        weather_data = requests.get(Final_url).json()
        print(weather_data)
        

        
        print(weather_data['main']['temp'])
        temperature=weather_data['main']['temp']
        response = "La temperatura en {} es {}º.".format(city,temperature)
        dispatcher.utter_message(response)

        return [SlotSet('ciudad',city)]


class ActionHora(Action):

    def name(self) -> Text:
        return "action_hora"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        Final_url = "https://www.timeapi.io/api/Time/current/zone?timeZone=Europe/Madrid"    
        time_data = requests.get(Final_url).json()
        
        print(time_data)

        hora=time_data['time']
        response = "Son las {}.".format(hora)
        dispatcher.utter_message(response)




class AskForProvincias(Action):

    def name(self) -> Text:
        return "action_ask_provincia"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        Final_url = 'http://localhost:3001/api/provinces/all'   

        print("antes de la petición")

        time_data = requests.get(Final_url, headers={'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MTZkNzM3YjdkMzY0YzNiNmM1M2IxMWYiLCJyb2wiOiJST0xfQURNSU4iLCJpYXQiOjE2MzU5NTYyMDEsImV4cCI6MTY2NzUxMzgwMX0.xNW36wcmsLB9utCX5l2oQyCi6FXftgHWb-QpkMY4Q60'}).json()
        
        #print(time_data)

       
        #data2 = [{"label":"Seleccione una provincia","value":"Seleccione una provincia"},{"label":"Alava","value":"Alava"},{"label":"Albacete","value":"Albacete"},{"label":"Alicante","value":"Alicante"},{"label":"Almeria","value":"Almeria"},{"label":"Asturias","value":"Asturias"},{"label":"Avila","value":"Avila"},{"label":"Badajoz","value":"Badajoz"},{"label":"Barcelona","value":"Barcelona"},{"label":"Burgos","value":"Burgos"},{"label":"Cantabria","value":"Cantabria"},{"label":"Castellón","value":"Castellón"},{"label":"Ceuta","value":"Ceuta"},{"label":"Ciudad Real","value":"Ciudad Real"},{"label":"Cuenca","value":"Cuenca"},{"label":"Cáceres","value":"Cáceres"},{"label":"Cádiz","value":"Cádiz"},{"label":"Córdoba","value":"Córdoba"},{"label":"Girona","value":"Girona"},{"label":"Granada","value":"Granada"},{"label":"Guadalajara","value":"Guadalajara"},{"label":"Guipúzcoa","value":"Guipúzcoa"},{"label":"Huelva","value":"Huelva"},{"label":"Huesca","value":"Huesca"},{"label":"Islas Baleares","value":"Islas Baleares"},{"label":"Jaén","value":"Jaén"},{"label":"La Coruña","value":"La Coruña"},{"label":"La Rioja","value":"La Rioja"},{"label":"Las Palmas","value":"Las Palmas"},{"label":"León","value":"León"},{"label":"Lugo","value":"Lugo"},{"label":"Lérida","value":"Lérida"},{"label":"Madrid","value":"Madrid"},{"label":"Melilla","value":"Melilla"},{"label":"Murcia","value":"Murcia"},{"label":"Málaga","value":"Málaga"},{"label":"Navarra","value":"Navarra"},{"label":"Orense","value":"Orense"},{"label":"Palencia","value":"Palencia"},{"label":"Pontevedra","value":"Pontevedra"},{"label":"Salamanca","value":"Salamanca"},{"label":"Santa Cruz de Tenerife","value":"Santa Cruz de Tenerife"},{"label":"Segovia","value":"Segovia"},{"label":"Sevilla","value":"Sevilla"},{"label":"Soria","value":"Soria"},{"label":"Tarragona","value":"Tarragona"},{"label":"Teruel","value":"Teruel"},{"label":"Toledo","value":"Toledo"},{"label":"Valencia","value":"Valencia"},{"label":"Valladolid","value":"Valladolid"},{"label":"Vizcaya","value":"Vizcaya"},{"label":"Zamora","value":"Zamora"},{"label":"Zaragoza","value":"Zaragoza"}]

        data = []

        data.append({"label": "Seleccione una provincia", "value": "Seleccione una provincia"})


        #print(data3);

        #print(data2)

        for plst in time_data['provinces']:
            #data = data+'{"label":"'+plst['name']+'","value":"'+plst['name']+'"},'
            data.append({"label":plst['uid'],"value":plst['name']})
        

        #data3 =  data.replace('"','\'')
        #print(data3)
        message={"payload":"dropDown","data":data}
        #print(data);
        dispatcher.utter_message(text="Hello World!",json_message=message)
        return []  

       

class AskForPueblo(Action):
    def name(self) -> Text:
        return "action_ask_pueblo"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
                print("ask pueblo")
                lugar = tracker.get_slot('provincia')
                print(lugar)
                Final_url = 'http://localhost:3001/api/towns/?province='+lugar
                data = requests.get(Final_url, headers={'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MTZkNzM3YjdkMzY0YzNiNmM1M2IxMWYiLCJyb2wiOiJST0xfQURNSU4iLCJpYXQiOjE2MzU5NTYyMDEsImV4cCI6MTY2NzUxMzgwMX0.xNW36wcmsLB9utCX5l2oQyCi6FXftgHWb-QpkMY4Q60'}).json()
                data2 = []

                data2.append({"label": "Seleccion un pueblo", "value": "Seleccione un pueblo"})

                for plst in data['towns']:
                    #data = data+'{"label":"'+plst['name']+'","value":"'+plst['name']+'"},'
                    data2.append({"label":plst['uid'],"value":plst['name']})


                print(data2)
                message={"payload":"dropDown","data":data2}
                #print(data);
                dispatcher.utter_message(text="Hello World!",json_message=message)
                return []

class AskForLugar(Action):
    def name(self) -> Text:
        return "action_ask_lugar"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
                print("ask lugar")
                lugar = tracker.get_slot('pueblo')
                print(lugar)
                Final_url = 'http://localhost:3001/api/places/?town='+lugar
                data = requests.get(Final_url, headers={'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MWRjNDFjNDMwN2UwNTJlYTBmN2MzN2EiLCJyb2wiOiJST0xfQURNSU4iLCJpYXQiOjE2NDE4MjQ3NzEsImV4cCI6MTY3MzM4MjM3MX0.w675urv3jmkvHNjMFPvunGpX_1h4Gtp5vcy3ObJEi3I'}).json()
                print(data)
                data2 = []

                data2.append({"label": "Seleccione un lugar", "value": "Seleccione un lugar"})

                for plst in data['places']:
                    #data = data+'{"label":"'+plst['name']+'","value":"'+plst['name']+'"},'
                    data2.append({"label":plst['uid'],"value":plst['name']})


                print(data2)
                message={"payload":"dropDown","data":data2}
                #print(data);
                dispatcher.utter_message(text="Hello World!",json_message=message)
                return []
            
            
class AskForInformacion(Action):
    def name(self) -> Text:
        return "action_ask_tipo"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
                print("ask inforr")
                
                data2 = []

                data2.append({"label": "¿Qué información desea?", "value": "¿Qué información desea?"})
                
                data2.append({"label": "location","value":"Ubicación"}) 
                data2.append({"label": "description","value":"Descripción"})
                data2.append({"label": "web","value":"Web"})
                data2.append({"label": "schedule","value":"Horario"})

                print(data2)
                message={"payload":"dropDown","data":data2}
                #print(data);
                dispatcher.utter_message(text="Hello World!",json_message=message)
                return []
    
class AskForDetalle(Action):
    def name(self) -> Text:
        return "action_ask_detalle"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
                lugar = tracker.get_slot('lugar')
                tipos = tracker.get_slot('tipo')
                Final_url = 'http://localhost:3001/api/places/?id='+lugar
                data = requests.get(Final_url, headers={'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MWRjNDFjNDMwN2UwNTJlYTBmN2MzN2EiLCJyb2wiOiJST0xfQURNSU4iLCJpYXQiOjE2NDE4MjQ3NzEsImV4cCI6MTY3MzM4MjM3MX0.w675urv3jmkvHNjMFPvunGpX_1h4Gtp5vcy3ObJEi3I'}).json()
                
                print(data)
                
                if tipos=='location':
                    final=data['places']['location']
                    response="La ubicación del lugar es: {}".format(final)
                elif tipos=='web':
                    final=data['places']['web']
                    response="La web del lugar es: {}".format(final)
                elif tipos=='schedule':
                    final=data['places']['schedule']
                    response="El horario del lugar es: {}".format(final)
                
                dispatcher.utter_message(response)             
                
                return []


class ValidateRegisterForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_register_form"

    def validate_email(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict,
        ) -> Dict[Text, Any]:
            """Validate email value."""
            print(slot_value.lower())
            if slot_value.lower() == 'salir':
                print('true')
                dispatcher.utter_message("Necesitas algo más?")
                return {"requested_slot":None}

    def validate_consent(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict,
        ) -> Dict[Text, Any]:
            """Validate email value."""
            print(slot_value.lower())
            if slot_value.lower() == 'salir':
                print('true')
                dispatcher.utter_message("Necesitas algo más?")
                return {"requested_slot":None}

    

    def validate_email(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict,
        ) -> Dict[Text, Any]:
            """Validate email value."""
            print(slot_value.lower())
            if slot_value.lower() == 'salir':
                print('true')
                dispatcher.utter_message("Necesitas algo más?")
                return {"requested_slot":None}

class submitRegister(Action):

    def name(self) -> Text:
        return "submit_register"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        Final_url = 'http://localhost:3001/api/users'   
        email = tracker.get_slot('email')
        name = tracker.get_slot('name')
        pwd = tracker.get_slot('pwd')
        pwd2 = tracker.get_slot('pwd2')
        consent = tracker.get_slot('consent')

        true = True;

        PARAMS = {
        'email':email,
        'name':name,
        'password':pwd,
        'repassword':pwd2,
        'accept':True
        }

        time_data = requests.post(Final_url, headers={'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MTZkNzM3YjdkMzY0YzNiNmM1M2IxMWYiLCJyb2wiOiJST0xfQURNSU4iLCJpYXQiOjE2MzU5NTYyMDEsImV4cCI6MTY2NzUxMzgwMX0.xNW36wcmsLB9utCX5l2oQyCi6FXftgHWb-QpkMY4Q60'}, json = (PARAMS))
        
        dataaa = time_data.json()

        x = json.dumps(dataaa)

        y = x.split("msg")

        z = y[1]
        print(y);
        z = z[4:]

        omega = z.split('"')


        #print(time_data.json()['errores']['email']['msg'])

        dispatcher.utter_message(omega[0])

        #hora=time_data['time']
       
        #dispatcher.utter_message(time_data)


class submitRecomendacion(Action):

    def name(self) -> Text:
        return "submit_recomendacion"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

                provincia = tracker.get_slot('provincia')

                print("ask pueblo")
                Final_url = 'http://localhost:3001/api/towns/?province='+provincia
                data = requests.get(Final_url, headers={'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MTZkNzM3YjdkMzY0YzNiNmM1M2IxMWYiLCJyb2wiOiJST0xfQURNSU4iLCJpYXQiOjE2MzU5NTYyMDEsImV4cCI6MTY2NzUxMzgwMX0.xNW36wcmsLB9utCX5l2oQyCi6FXftgHWb-QpkMY4Q60'}).json()
                data2 = []

                lugaresRecomendados = []

                data2.append({"label": "Seleccion un pueblo", "value": "Seleccione un pueblo"})

                for plst in data['towns']:

                  #  k = random.randint(0, 1) # decide on k once
                    if len(lugaresRecomendados) < 2:
                        lugaresRecomendados.append({"label":plst['uid'],"value":plst['name']})
                    #data = data+'{"label":"'+plst['name']+'","value":"'+plst['name']+'"},'
                    data2.append({"label":plst['uid'],"value":plst['name']})


                for e in range(len(lugaresRecomendados)):
                    print("Lugares seleccionados: ", lugaresRecomendados[e])


                print(data2)
                message={"payload":"dropDown","data":lugaresRecomendados}
                #print(data);
                dispatcher.utter_message(text="Recomendacion", json_message=message)
                return []


class submitReview(Action):

    def name(self) -> Text:
        return "submit_review"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        print("REVIEWWW")
        Final_url = 'http://localhost:3001/api/reviews?chatbot=true'   
        comentario = tracker.get_slot('comentario')
        calificacion = tracker.get_slot('calificacion')
        lugar = tracker.get_slot('lugar')

        PARAMS = {
        'comment':comentario,
        'review':calificacion,
        'place':lugar
        }

        slot_xtoken = tracker.get_slot('xtoken')

        if slot_xtoken is None:
            dispatcher.utter_message(text="Tienes que estar logueado para hacer una review")
        else:
            time_data = requests.post(Final_url, headers={'x-token': slot_xtoken}, json = (PARAMS))
        
            print(time_data)
            print(time_data.json())

            if time_data.json()['msg'] == "The review has been created":
                dispatcher.utter_message(text="Review creada con exito!")
            else:
                dispatcher.utter_message(text=time_data.json()['msg'])


class ActionHelloWorld(Action):

    def name(self) -> Text:
        return "hello_world"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        
        data=[{"label":"option1","value":"option1"},{"label":"option2","value":"/inform{'slot_name':'option2'}"},{"label":"option3","value":"/inform{'slot_name':'option3'}"}]
        print(data)
        message={"payload":"dropDown","data":data}
        dispatcher.utter_message(text="Hello World!",json_message=message)

        return []