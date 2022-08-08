var init = false;
var username = "";
var myLink;
var myLink2;

$(document).ready(function() {
    var user = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
    var xtoken = localStorage.getItem('x-token');

    var checkExists = setInterval(() => {
        if (document.querySelector("#imgActivar")) {
            myLink = document.getElementById('imgActivar');
            myLink.onclick = function fun() {
                abrirChatBot();
            }
            clearInterval(checkExists);
        }
    }, 500);

    var checkExistss = setInterval(() => {
        if (document.querySelector("#cerrar")) {
            myLink2 = document.getElementById('cerrar');
            myLink2.onclick = function fun() {
                cerrarChatBot();
            }
            clearInterval(checkExistss);
        }
    }, 500);

    if (xtoken != null) {
        var checkExist = setInterval(() => {
            if (document.querySelector("#username")) {
                username = document.getElementById("username").textContent;
                clearInterval(checkExist);
            }
        }, 500);
        sendXtoken(xtoken);
    }




    // ------------------------------------------ Toggle chatbot -----------------------------------------------



    function cerrarChatBot() {

        var x = document.getElementById("mybot");
        var i = document.getElementById("imgActivar");

        x.classList.toggle("active");
        i.classList.toggle("active");

    };

    function abrirChatBot() {

        if (init == false) {
            var msginit;
            var buttoninit;
            if (username != "") {
                msginit = '<div class="leftChat"><img width="20" class = "chatbotIcon" src="assets/js/chatbot.png"/>' + '<p class="botResult">' + 'Bienvenido de nuevo ' + username + '  que necesitas?' + '</p><div class="clearfix"></div></div>';
                buttoninit = '<div class="leftChat"><img width="20" class = "chatbotIcon" src="assets/js/chatbot.png"/><button type="button" class = "chatbotbutton">Valoración</button><button type="button" class = "chatbotbutton">Recomendaciónc</button><button type="button" id = "info" class = "chatbotbutton">Información</button></div>';
            } else {
                msginit = '<div class="leftChat"><img width="20" class = "chatbotIcon" src="assets/js/chatbot.png"/>' + '<p class="botResult">' + 'Hola, me llamo Towny puedes preguntarme lo que quieras o seleccionar una de estas opciones' + '</p><div class="clearfix"></div></div>';
                buttoninit = '<div class="leftChat"><img width="20" class = "chatbotIcon" src="assets/js/chatbot.png"/><button type="button" class = "chatbotbutton">Registro</button><button type="button" class = "chatbotbutton">Recomendación</button><button type="button" id = "info" class = "chatbotbutton">Información</button></div>'
            }
            init = true;

            $(msginit).appendTo('#result_div');

            $(buttoninit).appendTo('#result_div');
            document.getElementById('chat-input').focus();

        }

        var x = document.getElementById("mybot");
        var i = document.getElementById("imgActivar");

        x.classList.toggle("active");
        i.classList.toggle("active");
        document.getElementById('chat-input').focus();



    };

    $(document).on('click', '.chatbotbutton', function() {

        var tbutton = ($(this).text());

        setUserResponse(tbutton);
        send(tbutton);



    });


    // on input/text enter--------------------------------------------------------------------------------------
    $('#chat-input').on('keyup keypress', function(e) {
        var keyCode = e.keyCode || e.which;
        var text = $("#chat-input").val();
        if (keyCode === 13) {
            if (text == "" || $.trim(text) == '') {
                e.preventDefault();
                return false;
            } else {
                $("#chat-input").blur();
                var input = document.getElementById("chat-input");
                //Si el input está en modo contraseña
                if (input.style.webkitTextSecurity == "disc") {
                    //mensaje con solo asteriscos para que no se vea la contraseña
                    var str = new Array(text.length + 1).join('*');
                    setUserResponse(str);

                } else {
                    setUserResponse(text);
                }
                send(text);
                e.preventDefault();
                return false;
            }
        }
    });

    //------------------------------------------- Call the RASA API XTOKEN SEND--------------------------------------
    function sendXtoken(text) {
        $.ajax({
            url: ('https://h252.eps.ua.es/conversations/' + user + '/tracker/events'), //  RASA API
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: `{"event":"slot","name":"xtoken","value":"` + xtoken + `","timestamp":0}`,
            success: function(data, textStatus, xhr) {},
            error: function(xhr, textStatus, errorThrown) {
                setBotResponse('error');
            }
        });
    }


    //------------------------------------------- Call the RASA API--------------------------------------
    function send(text) {


        $.ajax({
            url: 'https://h252.eps.ua.es/webhooks/rest/webhook', //  RASA API
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                "sender": user, //add the user ID here
                "message": text
            }),
            success: function(data, textStatus, xhr) {

                var input = document.getElementById("chat-input");
                if (data[0]["text"] == "Escribe la contraseña." || data[0]["text"] == "Repite la contraseña.") {


                    input.style.webkitTextSecurity = "disc";


                } else {
                    input.style.webkitTextSecurity = "none";
                }

                if (data[0]["text"] == "Hello World!") {



                }

                if (Object.keys(data).length !== 0) {
                    for (i = 0; i < Object.keys(data[0]).length; i++) {
                        if (Object.keys(data[0])[i] == "buttons") { //check if buttons(suggestions) are present.
                            addSuggestion(data[0]["buttons"])
                        }


                    }
                }

                setBotResponse(data);

            },
            error: function(xhr, textStatus, errorThrown) {
                setBotResponse('error');
            }
        });





    }

    //------------------------------------ Select Menú -------------------------------------





    //------------------------------------ Set bot response in result_div -------------------------------------
    function setBotResponse(val) {
        setTimeout(function() {

            if ($.trim(val) == '' || val == 'error') { //if there is no response from bot or there is some error
                val = 'Sorry I wasn\'t able to understand your Query. Let\' try something else!'
                var BotResponse = '<div class="leftChat"><img width="20" class = "chatbotIcon" src="assets/js/chatbot.png"/>' + '<p class="botResult">' + val + '</p><div class="clearfix"></div></div>';
                $(BotResponse).appendTo('#result_div');
            } else {

                //if we get message from the bot succesfully
                var msg = "";
                for (var i = 0; i < val.length; i++) {
                    if (val[0]["text"] == "Hello World!") {
                        var opciones = val[1]["custom"]["data"];
                        var select = document.createElement("select");
                        select.classList.add("selectChatbot");

                        select.onchange = function() {
                            var selected = select.value;
                            select.disabled = true;

                            setUserResponse(select.options[select.selectedIndex].text);
                            send(selected);

                            if (selected == "location") {}


                        };


                        for (i = 0; i < opciones.length; i++) {
                            var opt = opciones[i]["value"];
                            var id = opciones[i]["label"];
                            var el = document.createElement("option");
                            el.textContent = opt;
                            el.value = id;
                            select.appendChild(el);

                        }
                        msg = select;


                    } else if (val[0]["text"] == "Recomendacion") {


                        var opciones = val[1]["custom"]["data"];
                        var recomendaciones = ""


                        for (i = 0; i < opciones.length; i++) {

                            recomendaciones += opciones[i]["value"];

                            if (i + 1 < opciones.length)
                                recomendaciones += ", ";

                        }

                        msg = '<div class="leftChat"><img width="20" class = "chatbotIcon" src="assets/js/chatbot.png"/>' + '<p class="botResult">' + 'Basandome en lo seleccionado te recomiendo estos pueblos: ' + recomendaciones + '</p><div class="clearfix"></div></div>';



                    } else {
                        //comprobar que se va a escribir una contraseña
                        if (val[0]["text"] == "Escribe la contraseña." || val[0]["text"] == "Repite la contraseña.") {

                            msg += '<div class="leftChat"><img width="20" class = "chatbotIcon" src="assets/js/chatbot.png"/>' + '<p class="botResult">' + val[i].text + '</p><div class="clearfix"></div></div>';

                        } else {
                            if (val[i]["image"]) { //check if there are any images
                                msg += '<p class="botResult"><img  width="200" height="124" src="' + val[i].image + '/"></p><div class="clearfix"></div>';
                            } else {
                                msg += '<div class="leftChat"><img width="20" class = "chatbotIcon" src="assets/js/chatbot.png"/>' + '<p class="botResult">' + val[i].text + '</p><div class="clearfix"></div></div>';
                            }
                        }
                    }

                }

                var ubii = val[0]["text"].split(":");


                if (ubii[0] == "La ubicación del lugar es") {
                    mapa(ubii[1]);
                }

                BotResponse = msg;
                $(BotResponse).appendTo('#result_div');

                document.getElementById('chat-input').focus();
            }
            scrollToBottomOfResults();
            hideSpinner();
        }, 500);
    }

    function mapa(loc1) {
        var color = Microsoft.Maps.Color.fromHex('#6A94CC');
        map = new Microsoft.Maps.Map('#myMap', {
            credentials: 'AnswPVgCwxebusiX4nJAWUzMxj5WE6XF0guV_Do0fqXh0xqDO6jmdfqZ9YacQywJ',
            showZoomButtons: false, //Hide the default zoom buttons and create custom ones.
            showLocateMeButton: false,
            showBreadcrumb: false,
            showDashboard: false,
            backgroundColor: color
        });

        var loc2 = loc1.split(" ");
        var loc = new Microsoft.Maps.Location(loc2[1], loc2[2]);
        var pin = new Microsoft.Maps.Pushpin(loc);
        map.entities.push(pin);
        map.setView({
            center: loc,

        })



        $("#myMap").appendTo('#result_div');
        $("#myMap").css("display", "block");

    }

    //------------------------------------- Set user response in result_div ------------------------------------
    function setUserResponse(val) {
        var UserResponse = '<div class="rightChat"><p class="userEnteredText">' + val + '</p><div class="clearfix"></div></div>';
        $(UserResponse).appendTo('#result_div');
        $("#chat-input").val('');
        scrollToBottomOfResults();
        showSpinner();
        $('.suggestion').remove();
    }


    //---------------------------------- Scroll to the bottom of the results div -------------------------------
    function scrollToBottomOfResults() {
        var terminalResultsDiv = document.getElementById('result_div');
        terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
    }


    //---------------------------------------- Spinner ---------------------------------------------------
    function showSpinner() {
        $('.spinner').show();
    }

    function hideSpinner() {
        $('.spinner').hide();
    }




    //------------------------------------------- Buttons(suggestions)--------------------------------------------------
    function addSuggestion(textToAdd) {
        setTimeout(function() {
            var suggestions = textToAdd;
            var suggLength = textToAdd.length;
            $('<p class="suggestion"></p>').appendTo('#result_div');
            // Loop through suggestions
            for (i = 0; i < suggLength; i++) {
                $('<span class="sugg-options">' + suggestions[i].title + '</span>').appendTo('.suggestion');
            }
            scrollToBottomOfResults();
        }, 1000);
    }


    // on click of suggestions get value and send to RASA
    $(document).on("click", ".suggestion span", function() {
        var text = this.innerText;
        setUserResponse(text);
        send(text);
        $('.suggestion').remove();
    });
    // Suggestions end -----------------------------------------------------------------------------------------


});