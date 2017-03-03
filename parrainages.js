$.jqplot.config.enablePlugins = true;

function sort_as_integers(a, b) {
    return parseInt(a) - parseInt(b);
}

function build_intro() {
    $("#accordion-intro").accordion({
        collapsible: true,
        autoHeight: false,
        heightStyle: "content"
    });
}

/* Source:
 * http://www.ain.gouv.fr/IMG/pdf/nomenclature_categories_socioprofessionnelles.pdf
 */
var jobs = {
'1': 'agriculteurs-propriétaires exploitants',
'2': 'salariés agricoles',
'3': 'marins (patrons)',
'4': 'marins (salariés)',
'5': 'industriels-chefs d\'entreprise',
'6': 'administrateurs de sociétés',
'7': 'agents d\'affaires',
'8': 'agents immobiliers',
'9': 'commerçants',
'10': 'artisans',
'11': 'entrepreneurs en bâtiment',
'12': 'propriétaires',
'13': 'ingénieurs',
'14': 'agents techniques et techniciens',
'15': 'contremaîtres',
'16': 'représentants de commerce',
'17': 'agents d\'assurance',
'18': 'cadres supérieurs (privé)',
'19': 'autres cadres (privé)',
'20': 'employés (secteur privé)',
'21': 'ouvriers (privé)',
'22': 'assistantes sociales',
'23': 'salariés du secteur médical',
'24': 'médecins',
'25': 'chirurgiens',
'26': 'dentistes',
'27': 'vétérinaires',
'28': 'pharmaciens',
'29': 'avocats',
'30': 'notaires',
'31': 'huissiers',
'32': 'conseillers juridiques',
'33': 'agents généraux d\'assurance',
'34': 'experts comptables',
'35': 'ingénieurs conseils',
'36': 'architectes',
'37': 'journalistes et autres medias',
'38': 'hommes de lettres et artistes',
'39': 'autres professions libérales',
'40': 'étudiants',
'41': 'professeurs de faculté ',
'42': 'professeurs du secondaire et technique',
'43': 'enseignants 1er degré-directeurs d\'école',
'44': 'professions rattachées à l\'enseignement',
'45': 'magistrats',
'46': 'grands corps de l\'Etat',
'47': 'fonctionnaires catégorie A',
'48': 'fonctionnaires catégorie B',
'49': 'fonctionnaires catégorie C',
'50': 'cadres sup (entreprises publiques)',
'51': 'cadres (entreprises publiques)',
'52': 'employés (autres entreprises publiques)',
'53': 'agents subalternes (entreprises publiques)',
'54': 'permanents politiques',
'55': 'ministres du culte',
'56': 'autres professions',
'57': 'sans profession déclarée',
'58': 'retraités agricoles',
'59': 'retraités artisans, commerçants et chefs d\'entreprise',
'60': 'retraités des professions libérales',
'61': 'retraités salariés privés',
'62': 'retraités de l\'enseignement',
'63': 'retraités de la fonction publique (moins l\'enseignement)',
'64': 'retraités des entreprises publiques',
'65': 'autres retraités',
'99': 'pas de données'
}

function build_candidate_age_graph(stats, chart_id) {
    var ticks = []
    var data = []
    var title = 'Répartition des parrainages par âge (inconnu pour '
    title += stats['age']['117']+ ' élus)'
    delete stats['age']['117']
    Object.keys(stats['age']).sort(sort_as_integers).forEach(function (m) {
      ticks.push(m)
      data.push(stats['age'][m])
    });
    $.jqplot(chart_id, [data], {
        title: title,
        animate: false,
        seriesDefaults:{
	    renderer:$.jqplot.BarRenderer,
	    pointLabels: { show: true, labels:data }
        },
        axes: {
	    xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                tickRenderer: $.jqplot.CanvasAxisTickRenderer ,
	        ticks: ticks,
                tickOptions: {
                    angle: -60
                },
                label: "Âge"
	    },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
                //label: "Nombre de parrainages"
            }
        },
        highlighter: { show: false }
    }); 
}

function build_candidate_job_graph(stats, chart_id) {
    data = []
    Object.keys(stats['job']).sort(sort_as_integers).forEach(function (id) {
        if (stats['job'][id] > 0) {
            data.push([id + ' - ' + jobs[id], stats['job'][id]])
        }
    });
    $.jqplot(chart_id, [data], {
      title: 'Répartition des parrainages par CSP',
      height: '600px',
      seriesDefaults: {
        renderer: $.jqplot.PieRenderer,
        rendererOptions: {
          showDataLabels: true,
          padding: 10,
          shadow: false
        }
      },
      legend: {
        show: true,
        rendererOptions: {numberColumns: 2}
      },
      highlighter: {
        show: true,
        useAxesFormatters: false,
        tooltipFormatString: '%s'
      }
    });
    legend = $('#' + chart_id + ' table.jqplot-table-legend')
    legend.css('display','block');
    legend.css('z-index',100);
    canvas = $('#' + chart_id + ' canvas.jqplot-pieRenderer-highlight-canvas')
    legend.css('height', canvas.attr('height')-20 + 'px')
    legend.css('overflow-y','scroll');
}

function build_candidate_gender_graph(stats, chart_id) {
    var data = [['Homme', stats['gender']['M']],
                ['Femme', stats['gender']['F']]]
    $.jqplot(chart_id, [data], {
      title: 'Répartition Homme/Femme des parrainages',
      seriesDefaults: {
        renderer: $.jqplot.PieRenderer,
        rendererOptions: {
          showDataLabels: true,
          padding: 10,
          shadow: false
        }
      },
      legend: {
        show: true
      },
      highlighter: {
        show: true,
        useAxesFormatters: false,
        tooltipFormatString: '%s'
      }
    });
}

function build_candidate_mandate_graph(stats, chart_id) {
    data = []
    Object.keys(stats['mandate']).sort().forEach(function (m) {
        if (stats['mandate'][m] > 0) {
            data.push([m, stats['mandate'][m]])
        }
    });
    $.jqplot(chart_id, [data], {
        title: 'Répartition des parrainages par mandat',
        height: '600px',
      seriesDefaults: {
        renderer: $.jqplot.PieRenderer,
        rendererOptions: {
          showDataLabels: true,
          padding: 10,
          shadow: false
        }
      },
      legend: {
        show: true,
        rendererOptions: {numberColumns: 2}
      },
      highlighter: {
        show: true,
        useAxesFormatters: false,
        tooltipFormatString: '%s'
      }
    });
}

function build_candidate_graphs(stats) {
    var ids_to_names = {}
    Object.keys(stats).sort().forEach(function (candidate, i) {
        var total = stats[candidate]['total']
        var p = 'parrainage'
        if (total > 1)
            p += 's'
        $("#candidates").append("<h3>"+candidate+" (" + total + " " + p + ")</h3>")
        var candidate_id = "c"+i
        ids_to_names[candidate_id] = candidate;
        div = '<div id="' + candidate_id + '"></div>'
        $("#candidates").append(div)
    });
    $("#candidates").accordion({
      activate: function( event, ui ) {
          candidate_id = ui.newPanel.attr('id')
          if (candidate_id === undefined) {
              return;
          } else if (!(candidate_id in ids_to_names)) {
              return;
          } else {
              candidate_name = ids_to_names[candidate_id]
              div = ''
              div+= '<div id="' + candidate_id + '-age"></div>'
              div+= '<div id="' + candidate_id + '-job" style="height=600px"></div>'
              div+= '<div id="' + candidate_id + '-gender"></div>'
              div+= '<div id="' + candidate_id + '-mandate" style="height=600px"></div>'
              $('#' + candidate_id).append(div)
  
              build_candidate_age_graph(stats[candidate_name], candidate_id + '-age');
              build_candidate_job_graph(stats[candidate_name], candidate_id + '-job');
              build_candidate_gender_graph(stats[candidate_name], candidate_id + '-gender');
              build_candidate_mandate_graph(stats[candidate_name], candidate_id + '-mandate');
              delete ids_to_names[candidate_id];
          }
      },
      active: false,
      collapsible: true,
      autoHeight: false,
      heightStyle: "content"
    });
}

function build_parrain_csp_graphs(stats, chart_id, job_id) {
    data = []
    Object.keys(stats[job_id]).sort().forEach(function (candidate) {
        data.push([candidate, stats[job_id][candidate]])
    });
    $.jqplot(chart_id, [data], {
      title: 'Parrainages (' + jobs[job_id] + ')',
      seriesDefaults: {
        renderer: $.jqplot.PieRenderer,
        rendererOptions: {
          showDataLabels: true,
          padding: 10,
          shadow: false
        }
      },
      legend: {
        show: true,
        rendererOptions: {numberColumns: 2}
      },
      highlighter: {
        show: true,
        useAxesFormatters: false,
        tooltipFormatString: '%s'
      }
   
    });
}

function build_parrains_csp_graphs(stats) {
    var div_id_to_job_id = {}
    Object.keys(stats).sort(sort_as_integers).forEach(function (job_id) {
        var label = job_id + " - " + jobs[job_id]
        $('#parrains-csp').append('<h3>' + label + '</h3>')
        var id = 'parrain-csp-' + job_id
        div_id_to_job_id[id] = job_id;
        div = '<div id="' + id + '"></div>'
        $('#parrains-csp').append(div)
    });

    $("#parrains-csp").accordion({
        activate: function( event, ui ) {
            div_id = ui.newPanel.attr('id')
            if (div_id === undefined) {
                return
            } else if (!(div_id in div_id_to_job_id)) {
                return
            } else {
                job_id = div_id_to_job_id[div_id]
                div_chart = '<div id="' + job_id + '-chart"></div>'
                $('#' + div_id).append(div_chart);
                build_parrain_csp_graphs(stats, job_id + '-chart', job_id);
                delete div_id_to_job_id[div_id];
            }
        },
        active: false,
        collapsible: true,
        autoHeight: false,
        heightStyle: "content"
    });
}

function build_everything() {
    console.time('build_everything')
    build_intro()
    build_candidate_graphs(stats['candidates']);
    build_parrains_csp_graphs(stats['parrains-csp'])
    console.timeEnd('build_everything')
}
