/*global ericstassen _config*/

var ericstassen = window.ericstassen || {};
ericstassen.map = ericstassen.map || {};

var user = localStorage.getItem('user') || null;
var project = localStorage.getItem("project")

// document.getElementById('default').style.display = 'block';
document.getElementById('loading').style.display = 'none';

if (user) {
    var idtoken = localStorage.getItem('CognitoIdentityServiceProvider.ci44ue8rbkdohiqg4p5ktapn6.' + user + '.idToken') || null;
    } else {
        var idtoken = null;
    };

if (user && project && idtoken) {
    // document.getElementById('default').style.display = 'none';
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
            function requestProjectdropdown(project_name, project_button, dropdown_value) {
                $('#' + project_button + "_dropdowncontents").html("Loading...");
                $.ajax({
                    method: 'POST',
                    url: _config.api.invokeUrlprojects + '/projectdropdown?project_name=' + project_name + '&project_button=' + project_button + '&date=' + dropdown_value,
                    headers: {
                        Authorization: authToken
                    },
                    contentType: 'application/json',
                    success: completeprojectdropdownRequest,
                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                        $('#' + project_button + "_dropdowncontents").html('error');
                    }
                });
            }

            function requestProject(project_name, project_button) {
                // $('#contents_' + project_button).html("Loading...");
                $("#" + project_button).append("<div id='contents_" + project_button + "' style='overflow-x:auto;'>"
                + "<p>Loading...</p>"+
                "</div>");
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

            function completeprojectdropdownRequest(result) {
                $('#' + result['project_button'] + "_dropdowncontents").html(result['html']); //result['project_button']
                // alert(result['project_name'] + result['button_name'] + result['html'])
                if ("table_data" in result) {
                    $("#table_"+ result['project_button']).DataTable({
                        // "destroy": true, // In order to reinitialize the datatable
                        // "pagination": true, // For Pagination
                        // "sorting": true, // For sorting
                        "aaData": result['table_data'],
                        "columns": result['table_columns'],
                        "scrollX": true,
                        columnDefs: [ { "defaultContent": "", "targets": "_all" } ]
                    });
                }
            }

            function completeprojectRequest(result) {
                var project_content = document.getElementById("contents_"+ result['project_button']);
                if (project_content) {
                    document.getElementById("contents_"+ result['project_button']).remove();
                }
                $("#" + result['project_button']).append("<div id='contents_" + result['project_button'] + "' style='overflow-x:auto;'>"
                + "<p>Click on the button again to remove the results</p>"
                +result['html']+
                "</div>");
                if (result['graph'] === "TRUE") {
                    var label_dict = {};
                    for (let graph_data of result['graph_data']) {
                        $("#contents_" + result['project_button']).append('<div class="chart-container" style="height:300px; width:100%;"><canvas id="Chart_'  + graph_data['name'] + '"></canvas></div>'); // width:100%;max-width:1000px;min-height:300px;
                        
                        var xValues = graph_data[graph_data['x-axis']];
                        
                        var chart_data = [];
                        
                        for (let y of graph_data['y-axis']) {
                            chart_data.push({
                                data: graph_data[y],
                                borderColor: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),
                                fill: false,
                                label: y,
                                })
                        }

                        var label_data = [];
                        
                        for (var i = 0; i < graph_data[graph_data['y-axis'][0]].length; i++) {
                            var temp = "";
                            for (let y of graph_data['y-axis']) {
                                temp = temp + y + ': ' + graph_data[y][i] + ' ';
                            }
                            label_data.push(temp)
                        }

                        label_dict[graph_data['name']] = label_data;
                        new Chart("Chart_" + graph_data['name'], {
                        type: "line",
                        data: {
                            labels: xValues, //result['graph_data'][result['graph_data']['labels']],
                            datasets: chart_data
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            legend: {display: true},
                            title: {
                                display: true,
                                text: graph_data['title']
                            },
                            tooltips: {
                                enabled: true,
                                mode: 'single',
                                callbacks: {
                                    label: function (tooltipItems) {
                                        return label_dict[graph_data['name']][tooltipItems.index]+ graph_data['labels'] + ': ' + graph_data[graph_data['labels']][tooltipItems.index];
                                        }
                                    }
                                },
                            scales: {
                                yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: graph_data['y-label']
                                }
                                }],
                                xAxes: [{
                                    scaleLabel: {
                                    display: true,
                                    labelString: graph_data['x-label']
                                    },
                                    ticks: {
                                        autoSkip: true,
                                        maxTicksLimit: 20
                                    }
                                }]
                            }
                        }
                        });
                }
                }
                if (result['dropdown'] === "TRUE") {
                    document.getElementById(result['project_button'] + "_dropdown").onchange = function(){
                        if (document.getElementById(result['project_button'] + "_dropdown").value === 'none') {
                            $('#' + result['project_button'] + "_dropdowncontents").html('');
                        } else {
                            requestProjectdropdown(project,result['project_button'], document.getElementById(result['project_button'] + "_dropdown").value)
                        }
                    }
                };
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
                    // $("." + button_name).append("<div id='contents_" + button_name + "' style='overflow-x:auto;'></div>");
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