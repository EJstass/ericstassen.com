/*global ericstassen _config*/

var ericstassen = window.ericstassen || {};
ericstassen.map = ericstassen.map || {};

var idtoken = localStorage.getItem('CognitoIdentityServiceProvider.ci44ue8rbkdohiqg4p5ktapn6.ericstassen.idToken') || null;

document.getElementById('default').style.display = 'none';
document.getElementById('loading').style.display = 'none';

if (idtoken) {
    document.getElementById('default').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
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
                    // console.error('Error requesting projects: ', textStatus, ', Details: ', errorThrown);
                    // console.error('Response: ', jqXHR.responseText);
                    document.getElementById('loading').style.display = 'none';
                    var project_link = "<p>You have been signed out. Please sign in again</p>";
                    $("#project_links").append(project_link);
                    signOut()
                }
            });
        }
    
        requestProjects()

        var reply_click = function()
        {
            // alert("Button clicked, id "+this.id+", text"+this.innerHTML);
            localStorage.setItem("project", this.id)
            // console.log(localStorage.getItem("project"))
        }

        function completeRequest(result) {
            // console.log('Response received from API: ', result);
            document.getElementById('loading').style.display = 'none';
            // var arrayLength = Object.keys(result).length;
            for (let i of Object.keys(result)) {
                // console.log(result.i);
                // var project_link = "<li><a href='#'>" + Object.keys(result[i])[0] + "</a></li>";
                var project_link = '<br><form action="project.html"><button type="submit" class="submit" class="restricted_projects" id="' + i + '" value=' + i + '>' + i + '</button></form>';
                $("#project_links").append(project_link);
                document.getElementById(i).onclick = reply_click;
                // var project_links = document.getElementById("project_links");
                // // var mycontent = document.createElement("a");
                // project_links.appendChild(document.createTextNode(Object.values(result[i])[0]));
                // console.log(result[i]);
            }
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
    
}
else {
    document.getElementById('default').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}