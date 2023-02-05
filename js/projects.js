/*global ericstassen _config*/

var ericstassen = window.ericstassen || {};
ericstassen.map = ericstassen.map || {};

var user = localStorage.getItem('user') || null;

// document.getElementById('default').style.display = 'none';
// document.getElementById('loading').style.display = 'none';

if (user) {
    var idtoken = localStorage.getItem('CognitoIdentityServiceProvider.ci44ue8rbkdohiqg4p5ktapn6.' + user + '.idToken') || null;
    // console.log(idtoken);
} else {
        var idtoken = null;
    };

if (user && idtoken) {
    // document.getElementById('default').style.display = 'none';
    // document.getElementById('loading').style.display = 'block';
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
                // window.location.href = './signin.html';
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
                    // document.getElementById('loading').style.display = 'none';
                    var project_link = "<p>You have been signed out. Please sign in again</p>";
                    $("#loading").html(project_link);
                    signOut()
                }
            });
        }
    
        requestProjects()

        var reply_click = function()
        {
            localStorage.setItem("project", this.id)
        }

        function completeRequest(result) {
            document.getElementById('loading').style.display = 'none';
            for (let i of Object.keys(result)) {
                var project_link = '<br><form action="project.html"><button type="submit" class="submit" class="restricted_projects" id="' + i + '" value=' + i + '>' + i + '</button></form>';
                $("#project_links").append(project_link);
                document.getElementById(i).onclick = reply_click;
            }
        }
    
    }(jQuery));
    
}
else {
    $("#loading").html("Sign in to see more...")
}