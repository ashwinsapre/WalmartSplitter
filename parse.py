from bs4 import BeautifulSoup
import json
import sys

def parse_html(file_path):
    f = open(file_path, "r")
    htmltxt = f.read()
    parsed_html = BeautifulSoup(htmltxt)
    items = {}
    for item in parsed_html.find_all("div", {"class": "dn print-items-list"}):
        item_name = item.findChild("div", {"class":"pv2 flex justify-between"}).findChild("div", {"class":"w_U9_0 w_sD6D w_QcqU"}).string
        item_cost = float(item.findChild("div", {"class":"print-bill-price"}).findChild("div", {"class":"w_U9_0 w_sD6D w_QcqU"}).string[1:]);
        items[item_name]=item_cost
        if item.findChild("div", {"class":"print-bill-type"}).findChild("div", {"class":"w_U9_0 w_sD6D w_QcqU"}).string == "Unavailable":
            items[item_name]=0
    items['ORDER TOTAL'] = float(parsed_html.find("div", {"class":"flex justify-between pv3 bill-order-total-payment"}).findAll("h2", {"class":"w_kV33 w_LD4J w_mvVb f5 f4-m lh-copy"})[-1].string[1:])
    items['TAXES AND TIP'] = round(items['ORDER TOTAL'] - sum([items[k] for k in items.keys() if k!="ORDER TOTAL"]),2)
    with open('items.json', 'w') as fp:
        json.dump(items, fp)

parse_html(sys.argv[1])