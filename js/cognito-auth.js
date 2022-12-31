/*global ericstassen _config AmazonCognitoIdentity AWSCognito*/

var ericstassen = window.ericstassen || {};

// console.log(localStorage);

var user = localStorage.getItem('user') || null;

// console.log(idtoken)
if (user) {
    var idtoken = localStorage.getItem('CognitoIdentityServiceProvider.ci44ue8rbkdohiqg4p5ktapn6.' + user + '.idToken') || null;
    } else {
        var idtoken = null;
    };

if (user && idtoken) {
    document.getElementById('signinForm').style.display = 'none';
    document.getElementById('signout').style.display = 'block';
    $(".subtitle").html("You're currently signed in as: " + user);
    var idtoken = localStorage.getItem('CognitoIdentityServiceProvider.ci44ue8rbkdohiqg4p5ktapn6.' + user + '.idToken') || null;
}
else {
    document.getElementById('signinForm').style.display = 'block';
    document.getElementById('signout').style.display = 'none';
}
(function scopeWrapper($) {
    var signinUrl = './signin.html';

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
        localStorage.removeItem('user');
        localStorage.clear();
    };

    ericstassen.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    // console.log(cognitoUser);
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });
    // console.log("ericstassen.authToken");
    // console.log(ericstassen.authToken.result);
    // if (typeof ericstassen.authToken.result !== 'undefined') {
    //     document.getElementById('signinForm').style.display = 'none';
    //     document.getElementById('signout').style.display = 'block';
    // } else {
    //     document.getElementById('signinForm').style.display = 'block';
    //     document.getElementById('signout').style.display = 'none';
    // }
    

    /*
     * Cognito User Pool functions
     */

    function register(username, password, onSuccess, onFailure) {
        var datausername = {
            Name: 'username',
            Value: username
        };
        var attributeusername = new AmazonCognitoIdentity.CognitoUserAttribute(datausername);

        userPool.signUp(toUsername(username), password, [attributeusername], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(username, password, onSuccess, onFailure, mfaRequired, newPasswordRequired) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: toUsername(username),
            Password: password
        });

        var cognitoUser = createCognitoUser(username);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure,
            mfaRequired: mfaRequired,
            // newPasswordRequired: newPasswordRequired
        });
        // console.log(cognitoUser);
        
    }

    function verify(username, code, onSuccess, onFailure) {
        createCognitoUser(username).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(username) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: toUsername(username),
            Pool: userPool
        });
    }

    function toUsername(username) {
        return username.replace('@', '-at-').toLowerCase();
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#signout').submit(signOut);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
    });

    function handleSignin(event) {
        var username = $('#username').val();
        var password = $('#password').val();
        event.preventDefault();
        signin(username, password,
            function signinSuccess() {
                localStorage.setItem('user', username.toLowerCase());
                // var theDiv = document.getElementById('subtitle');
                // var content = document.createTextNode("Hi " + username + "! You successfully signed in!");
                // theDiv.appendChild(content);
                document.getElementById('signinForm').style.display = 'none';
                document.getElementById('signout').style.display = 'block';
                $(".subtitle").html("You're currently signed in as: " + username);
                // $(".subtitle").append("Hi " + username + "! You successfully signed in!");
                // var cognitoUser = UserPool.getCurrentUser();
                // theDiv.appendChild(" " + cognitoUser);
                // result_display.innerHTML += "You successfully signed in";
                // window.location.href = 'index.html';
                // console.log('Successfully Logged In');
            },
            function signinError(err) {
                alert(err);
            },
            function mfaRequired(codeDeliveryDetails) {
                // MFA is required to complete user authentication.
                // Get the code from user and call
                cognitoUser.sendMFACode(mfaCode, this)
            },
     
            // function newPasswordRequired(userAttributes, requiredAttributes) {
            //     // User was signed up by an admin and must provide new
            //     // password and required attributes, if any, to complete
            //     // authentication.
     
            //     // the api doesn't accept this field back
            //     delete userAttributes.email_verified;
            //     // console.log("New Password Required");
            //     // store userAttributes on global variable
            //     // userAttributes: authenticationData; 
            //     // requiredAttributes: email;
            //     // var cognitoUser = createCognitoUser(username);
            //     var newPassword = password;
            //     // attributesData: object with key as attribute name and value that the user has given.
            //     cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes)
            // }
        );
    }
    function handleRegister(event) {
        var username = $('#usernameInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            // console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'index.html';
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(username, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var username = $('#usernameInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(username, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }
}(jQuery));