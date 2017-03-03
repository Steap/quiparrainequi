#!/usr/bin/env python3
# This code is terrible. Meh.
import csv
import datetime
import json

data_maires = None
data_maires_main = None


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


class Candidat(object):
    def __init__(self, name):
        self.name = name
        self.soutiens = []


class Soutien(object):
    def __init__(self, name, firstname, mandate):
        self.name = name
        self.firstname = firstname
        self.mandate = mandate
        self.gender = None
        self.birthdate = None
        self.party = None
        self.job = None

        if self.mandate == 'Maire':
            try:
                mayor_data = get_mayor_data(self.name, self.firstname)
                self.birthdate = mayor_data['birthdate']
                self.job = mayor_data['job']
            except ValueError:
                self._fill_with_obvious_bullshit()
        else:
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


def main():
    read_data_mayors()

    with open('data/20170301-1.json') as f:
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
