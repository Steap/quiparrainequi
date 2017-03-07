#!/usr/bin/env python3
# This code is terrible. Meh.
import csv
import datetime
import json
import unicodedata

data_maires = None
data_maires_main = None
data_sen_dep = None


def remove_accents(s):
    s = unicodedata.normalize('NFD', s)
    s = s.encode('ascii', 'ignore').decode('ascii')
    return s


def get_mayor_data(name, firstname):
    for mayor in data_maires:
        if name == mayor[5] and firstname == mayor[6]:
            birthdate = datetime.datetime.strptime(mayor[8], '%m/%d/%Y').date()
            return {
                'birthdate': birthdate,
                'job': mayor[9],
            }

    for mayor in data_maires_main:
        if name == mayor['Nom'] and firstname == mayor['Prénom']:
            birthdate = datetime.datetime.strptime(
                mayor['Naissance'], '%m/%d/%Y').date()
            return {
                'birthdate': birthdate,
                'job': '99',
            }
    raise ValueError('Could not find "%s %s"' % (name, firstname))


def get_sen_dep_data(name, firstname):
    name = remove_accents(name).upper()
    firstname = remove_accents(firstname).upper()

    # Some errors in the files provided by the government
    if name == 'MASSON' and firstname == 'JEAN-LOUIS':
        firstname = 'JEAN LOUIS'
    if name == 'VOGEL' and firstname == 'JEAN-PIERRE':
        firstname = 'JEAN PIERRE'

    acteurs = data_sen_dep['export']['acteurs']['acteur']
    for acteur in acteurs:
        n = remove_accents(acteur['etatCivil']['ident']['nom']).upper()
        p = remove_accents(acteur['etatCivil']['ident']['prenom']).upper()
        if n == name and p == firstname:
            birthdate = acteur['etatCivil']['infoNaissance']['dateNais']
            birthdate = datetime.datetime.strptime(birthdate, '%Y-%m-%d')
            return {
                'birthdate': birthdate.date(),
                'job': '99',
            }
    raise ValueError('Could not find "%s %s"' % (name, firstname))


class Candidat(object):
    def __init__(self, name):
        self.name = name
        self.soutiens = []


class Soutien(object):
    METHODS = {
        'Maire': get_mayor_data,
        'Sénateur/trice': get_sen_dep_data,
        'Député-e': get_sen_dep_data,
    }

    def __init__(self, name, firstname, mandate):
        self.name = name
        self.firstname = firstname
        self.mandate = mandate
        self.gender = None
        self.birthdate = None
        self.party = None
        self.job = None

        method = self.METHODS.get(self.mandate)
        if method is None:
            self._fill_with_obvious_bullshit()
        else:
            try:
                data = method(self.name, self.firstname)
                self.birthdate = data['birthdate']
                self.job = data['job']
            except ValueError:
                self._fill_with_obvious_bullshit()

    def _fill_with_obvious_bullshit(self):
        self.birthdate = datetime.datetime(1900, 1, 1).date()
        self.job = '99' # Does not exist

    def __repr__(self):
        return "%20s %20s | %c | %30s" % (
            self.name, self.firstname, self.gender, self.mandate)

    @property
    def age(self):
        # Nice trick from
        # http://stackoverflow.com/questions/2217488/age-from-birthdate-in-python
        today = datetime.date.today()
        return (today.year - self.birthdate.year - 
                ((today.month, today.day) <
                 (self.birthdate.month, self.birthdate.day)))


def generate_stats(candidates):
    stats = {
        'candidates': {},
        'parrains-csp': {},
    }
    for candidate in candidates:
        stats['candidates'][candidate.name] = {}
        s = stats['candidates'][candidate.name]

        s['age'] = {str(x): 0 for x in range(18,118)}
        s['gender'] = {'M': 0, 'F': 0}
        s['job'] = {}
        s['mandate'] = {}
        s['total'] = len(candidate.soutiens)
        for soutien in candidate.soutiens:
            s['age'][str(soutien.age)] += 1

            if soutien.gender == 'M':
                s['gender']['M'] += 1
            else:
                s['gender']['F'] += 1

            try:
                s['job'][soutien.job] += 1
            except KeyError:
                s['job'][soutien.job] = 1

            try:
                s['mandate'][soutien.mandate] += 1
            except KeyError:
                s['mandate'][soutien.mandate] = 1

            # Stats parrains-csp
            #stats['parrains-csp'][soutien.job][candidate.name] += 1
            j = stats['parrains-csp'].setdefault(soutien.job, {})
            try:
                j[candidate.name] += 1
            except KeyError:
                j[candidate.name] = 1

    return stats


def read_data_mayors():
    global data_maires
    global data_maires_main
    data_maires = []
    with open('data/maires-25-04-2014.csv') as f:
        for _ in range(4):
            f.readline()
        for row in  csv.reader(f, delimiter=','):
            data_maires.append(row)
    with open('data/main_maires.json') as f:
        data_maires_main = json.load(f)


def read_data_sen_dep():
    global data_sen_dep
    with open('data/AMO20_dep_sen_min_tous_mandats_et_organes_XIV.json') as f:
        data_sen_dep = json.load(f)


def main():
    read_data_mayors()
    read_data_sen_dep()

    with open('data/tous20170307.json') as f:
        p = json.load(f)

    candidates = []
    for elt in p:
        candidat = Candidat(elt['Candidat-e parrainé-e'])
        candidates.append(candidat)
        parrainages = elt['Parrainages']
        for parrain_json in parrainages:
            parrain = Soutien(parrain_json['Nom'],
                              parrain_json['Prénom'],
                              parrain_json['Mandat'])
            parrain.gender = 'M' if parrain_json['Civilité'] == 'M' else 'F'
            candidat.soutiens.append(parrain)


    # Generate stats
    stats = generate_stats(candidates)
    with open('web.jsonp', 'w') as f:
        f.write("stats = ")
        json.dump(stats, f)


if __name__ == '__main__':
    main()
