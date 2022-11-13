/*global ericstassen _config*/

var ericstassen = window.ericstassen || {};
ericstassen.map = ericstassen.map || {};

var user = localStorage.getItem('user') || null;
var project = localStorage.getItem("project")

document.getElementById('default').style.display = 'block';
document.getElementById('loading').style.display = 'none';

if (user) {
    var idtoken = localStorage.getItem('CognitoIdentityServiceProvider.ci44ue8rbkdohiqg4p5ktapn6.' + user + '.idToken') || null;
    } else {
        var idtoken = null;
    };

if (user && project && idtoken) {
    document.getElementById('default').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    var idtoken = localStorage.getItem('CognitoIdentityServiceProvider.ci44ue8rbkdohiqg4p5ktapn6.' + user + '.idToken') || null;
    if (project) {
        $("h1").append(project);
        (function projectsScopeWrapper($) {
            var poolData = {
                UserPoolId: _config.cognito.userPoolId,
                ClientId: _config.cognito.userPoolClientId
            };
        
            var userPool;
        
            if (!(_config.cognito.userPoolId &&
                _config.cognito.userPoolClientId &&
                _config.cognito.region)) {
                $('#noCognitoMessage').show();
                return;
            }
        
            userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        
            if (typeof AWSCognito !== 'undefined') {
                AWSCognito.config.region = _config.cognito.region;
            }
        
            ericstassen.signOut = function signOut() {
                userPool.getCurrentUser().signOut();
            };
        
            function signOut() {
                userPool.getCurrentUser().signOut();
            };
            
            var authToken;
            if (idtoken) {
                    authToken = idtoken;
                } else {
                    window.location.href = './signin.html';
                };
            function requestProjects() {
                $.ajax({
                    method: 'POST',
                    url: _config.api.invokeUrlprojects + '/projects',
                    headers: {
                        Authorization: authToken
                    },
                    contentType: 'application/json',
                    success: completeRequest,
                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                        window.location.replace("projects.html");
                    }
                });
            }
        
            requestProjects()
            function requestProject(project_name, project_button) {
                $.ajax({
                    method: 'POST',
                    url: _config.api.invokeUrlprojects + '/project?project_name=' + project_name + '&project_button=' + project_button,
                    headers: {
                        Authorization: authToken
                    },
                    contentType: 'application/json',
                    success: completeprojectRequest,
                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                        window.location.replace("projects.html");
                    }
                });
            }

            function completeprojectRequest(result) {
                // console.log('Response received from API: ', project, result);
                // console.log('Response received from API: ', result[project]);
                // console.log(result['project_button']);
                var project_content = document.getElementById("contents_"+ result['project_button']);
                if (project_content) {
                    document.getElementById("contents_"+ result['project_button']).remove();
                }
                $("#" + result['project_button']).append("<div id='contents_" + result['project_button'] + "' style='overflow-x:auto;'>"
                + "<p>Click on the button again to remove the results</p>"
                +result['html']+
                "</div>");
                // alert(result['project_name'] + result['button_name'] + result['html'])
            }

            function completeRequest(result) {
                // console.log('Response received from API: ', project, result);
                // console.log('Response received from API: ', result[project]);
                document.getElementById('loading').style.display = 'none';
                $("#project_html").append(result[project]['overview']);
                document.body.style.height="100%";
                document.body.style.width="100%";
                document.body.style.font="bold 12px/30px Georgia, sans-serif";
                document.body.style.background="linear-gradient(0DEG, transparent, rgba(6, 31, 55, 0.5)), url('img/" + result[project]['image'] + "')";
                document.body.style.backgroundPosition="center";
                document.body.style.backgroundRepeat="no-repeat";
                document.body.style.backgroundSize="cover";
                var a = document.getElementById('a_location'); //or grab it by tagname etc
                a.href = result[project]['location']
                for (let button_name of result[project]['buttons']) {
                    let btn = document.createElement("button");
                    btn.type = "submit";
                    btn.className = "submit";
                    btn.name = button_name;
                    btn.id = button_name;
                    btn.innerHTML = button_name;
                    btn.onclick = function () {
                        var project_content = document.getElementById("contents_"+ button_name);
                        if (project_content) {
                            document.getElementById("contents_"+ button_name).remove();
                        } else {
                            requestProject(project, button_name);
                        }
                    };
                    $("#project_links").append("<div class="+button_name+" id="+button_name+"></div>");
                    $("." + button_name).append(btn)
                  }
            }
        
        }(jQuery));
    } else {
        window.location.replace("projects.html");
    }
}
else {
    window.location.replace("projects.html");
}

window.onunload = function analytics(event) {
    localStorage.removeItem("project")
    window.location.replace("projects.html");
  };