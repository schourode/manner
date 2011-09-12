var parser = /^(\S+)\s*-\s*(\S+)\s+([^(]+)\(([^)]+)\)$/,
    groups = {
        'Barista': ['Christian','Jonathan','Luise','Morten','Uncas'],
        'Guide': ['Magrethe','Malene','Maria'],
        'P-vagt': ['Emil','J\u00f8rn','Rie'],
        'Madhold': ['Anne','Kristine'],
        'Alle': ['Barista','Guide','P-vagt','Madhold']
    },
    colors = {
        'Alle' : '#c00'
    };



var table = $('#persons'),
    thead = $('<thead>').appendTo(table),
    headerRow = $('<tr>').appendTo(thead).append('<td>'),
    tbody = $('<tbody>').appendTo(table);

for (var i = 0; i < 32; i++) {
    var decimal = i / 2 + 7,
        hours = Math.floor(decimal),
        minutes = decimal % 1 ? '30' : '00',
        label = hours + ':' + minutes;
        
    $('<th>').appendTo(headerRow).text(label);
}

function loadData(hash) {
    tbody.empty();
    
    $('h1 a').removeClass('selected')
        .filter('[href="' + hash + '"]').addClass('selected');
    
    $.get('data/' + hash.substring(1) + '.txt', function (data) {
        var persons = parseData(data);
        renderTable(persons);
    });
}

function parseData(data) {
    var lines = data.split('\n'),
        persons = {};
    
    for (var i in lines) {
        var tokens = lines[i].match(parser),
            entry = {
                start: tokens[1].trim(),
                end: tokens[2].trim(),
                text: tokens[3].trim(),
            },
            atendees = tokens[4].split(',');
        
        while (atendees.length > 0) {
            var name = atendees.pop().trim();
            if (groups[name]) {
                atendees = atendees.concat(groups[name]);
                continue;
            }
            
            if (!persons[name]) {
                persons[name] = [];
            }
            
            persons[name].push(entry);
        }
    }
    
    return persons;
}

function renderTable(persons) {
    var names = Object.keys(persons).sort();
    
    for (var i in names) {
        var name = names[i],
            entries = persons[name],
            row = $('<tr>').appendTo(tbody);
        
        $('<th>').text(name).appendTo(row);
        
        for (var j in entries) {
            var entry = entries[j];
            
            $('<td colspan=4>').css('background', '#f3a').text(entry.text).appendTo(row);
        }
    }
}

$(window).bind('hashchange', function () {
    loadData(location.hash);
});

if (location.hash) {
    loadData(location.hash);
}
else {
    var now = new Date(),
        day = now.getDay(),
        hash = $('h1 a').eq(day).attr('href');
    
    loadData(hash);
}