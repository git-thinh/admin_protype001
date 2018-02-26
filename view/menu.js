function menuCtrl($scope) {
    if (!w2ui.menu)
        $().w2sidebar({
            name: 'menu',
            flatButton: true,
            onFlat: function (event) {
                $('#menu').css('width', (event.goFlat ? '35px' : '199px'));
            },
            nodes: [
                {
                    id: 'level-1', text: 'Level 1', img: 'fa fa-folder-open-o', expanded: true, group: true,
                    nodes: [{ id: 'level-1-1', text: 'Level 1.1', icon: 'fa fa-home' },
                             { id: 'level-1-2', text: 'Level 1.2', icon: 'fa fa-star' },
                             { id: 'level-1-3', text: 'Level 1.3', icon: 'fa fa-star-o' }
                    ]
                },
                {
                    id: 'level-2', text: 'Level 2', img: 'fa fa-folder-open-o', expanded: true, group: true,
                    nodes: [{
                        id: 'level-2-1', text: 'Level 2.1', img: 'fa fa-folder-open-o', count: 3,
                        nodes: [
                        { id: 'level-2-1-1', text: 'Level 2.1.1', icon: 'fa fa-star-empty' },
                        { id: 'level-2-1-2', text: 'Level 2.1.2', icon: 'fa fa-star-empty', count: 67 },
                        { id: 'level-2-1-3', text: 'Level 2.1.3', icon: 'fa fa-star-empty' }
                        ]
                    },
                             { id: 'level-2-2', text: 'Level 2.2', icon: 'fa fa-star-empty' },
                             { id: 'level-2-3', text: 'Level 2.3', icon: 'fa fa-star-empty' }
                    ]
                }
            ]
        });

    $('#menu').w2render('menu');
}