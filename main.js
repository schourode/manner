var parser = /^(\S+)\s*-\s*(\S+)\s+([^(]+)\(([^)]+)\)$/,
    persons = {},
    groups = {
	'Barista': ['Christian','Jonathan','Luise','Morten','Uncas'],
	'Guide': ['Magrethe','Malene','Maria'],
	'P-vagt': ['Emil','Jørn','Rie'],
	'Madhold': [],
	'Alle': ['Barista','Guide','P-vagt','Madhold']
    };

$.get('data/mandag.txt', function (data) {
    var lines = data.split('\n');
    
    for (var i in lines) {
        var tokens = lines[i].match(parser),
            entry = {
                start: tokens[1].trim(),
                end: tokens[2].trim(),
                description: tokens[3].trim(),
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
    
    console.log(persons);
});