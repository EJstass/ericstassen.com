/*global ericstassen _config*/

var ericstassen = window.ericstassen || {};
ericstassen.map = ericstassen.map || {};

var idtoken = localStorage.getItem('CognitoIdentityServiceProvider.ci44ue8rbkdohiqg4p5ktapn6.ericstassen.idToken') || null;
var project = localStorage.getItem("project")

if (idtoken && project) {
    document.getElementById('default').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
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
                        console.error('Error requesting projects: ', textStatus, ', Details: ', errorThrown);
                        console.error('Response: ', jqXHR.responseText);
                        document.getElementById('loading').style.display = 'none';
                        var project_link = "<p>You have been signed out. Please sign in again</p>";
                        $("#project_links").append(project_link);
                        signOut()
                    }
                });
            }
        
            requestProjects()

            function completeRequest(result) {
                console.log('Response received from API: ', project, result);
                console.log('Response received from API: ', result[project]);
                document.getElementById('loading').style.display = 'none';
                $("#project_html").append(result[project]);
            }
            // function project(newUrl) {
            //     console.log(newUrl);
            //     document.location.href = newUrl;
            //   }
            
            // $(function onDocReady() {
            //     $('#' + Object.keys(result[i])[0]).submit(handleSignin);
            //     $('#signout').submit(signOut);
            //     $('#registrationForm').submit(handleRegister);
            //     $('#verifyForm').submit(handleVerify);
            // });
        
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