var smartStorePlugin;

force.login(function() {
    smartStorePlugin = cordova.require("com.salesforce.plugin.smartstore");
});

function loadFromSmartStore() {
    var querySpec = smartStorePlugin.buildSmartQuerySpec("select {houses:Id}, {houses:Name}, {houses:Price__c} from {houses}", 100);
    smartStorePlugin.runSmartQuery(querySpec, function(cursor) {
        var properties = cursor.currentPageOrderedEntries;
        render(properties);
    },
    function(error) {
        alert(error);
    });
}

function loadFromServer() {
    force.query('SELECT Id, Name, Price__c FROM Property__c LIMIT 10', function (response) {
        var properties = response.records;
        render(properties);
        saveToSmartStore(properties);
    });
}

function saveToSmartStore(properties) {
    var indexSpecs = [
        {"path": "Name", "type": "string"},
        {"path": "Id", "type": "string"},
        {"path": "Price__c", "type": "floating"}
    ];

    smartStorePlugin.registerSoup("houses", indexSpecs,
        function (soupName) {
            if (properties.length > 0) {
                smartStorePlugin.upsertSoupEntries("houses", properties,
                    function (items) {
                        alert(items.length + " records upserted in SmartStore");
                    },
                    function(error) {
                        alert("upsert error")
                    });
            }

        },
        function (error) {
            alert(error);
        });
}


function removeSoup() {
    smartStorePlugin.removeSoup("houses",
        function() {
            alert("removeSoup success");
        },
        function() {
            alert("removeSoup error");
        });
}

function render(properties) {
    var html = '';
    for (var i = 0; i < properties.length; i++) {
        html += '<li class="table-view-cell">' + (properties[i].Name || properties[i][1]) + '<p>' + (properties[i].Price__c || properties[i][2])+'</p></li>';
    }
    document.getElementById('houses').innerHTML = html;
}

function clearList() {
    document.getElementById('houses').innerHTML = "";
}
