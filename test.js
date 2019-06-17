"use strict";
const {after, before, it} = require("mocha");
const puppeteer = require("puppeteer");
const puppeteerCoverage = require("puppeteer-to-istanbul");

const runInBrowser = func => () => page.evaluate(func);

let browser, page;



// @todo also use npmjs.com/puppeteer-firefox
before(async () =>
{
	browser = await puppeteer.launch({ args: ["--no-sandbox"] });
	page = await browser.newPage();

	page.on("console", async msg => console[msg._type](...await Promise.all(msg.args().map(arg => arg.jsonValue()))));
	page.on("pageerror", console.error);

	await Promise.all(
	[
		page.addScriptTag({ path: "node_modules/chai/chai.js" }),
		page.addScriptTag({ path: "temp.js" }),

		// @todo https://github.com/istanbuljs/puppeteer-to-istanbul/issues/18
		// @todo https://github.com/GoogleChrome/puppeteer/issues/3570
		page.coverage.startJSCoverage({ reportAnonymousScripts: true })
	]);

	await page.evaluate(() =>
	{
		const iframe = document.createElement("iframe");
		document.body.append(iframe);
		window.anotherRealm = iframe.contentWindow;

		window.expect = chai.expect;
		delete window.chai; // cleanup
	});
});



after(async () =>
{
	let coverage = await page.coverage.stopJSCoverage();

	// Exclude tools
	coverage = coverage.filter(({url}) => !url.includes("chai"));

	puppeteerCoverage.write(coverage);

	browser.close();
});



it("is a (bundled) function", runInBrowser(() =>
{
	expect(window.isDetachedNode).to.be.a("function");
}));



it("returns false for a non-Node", runInBrowser(() =>
{
	const nodes =
	[
		"Node",
		Symbol("Node"),
		{},
		[],
		/regex/,
		true,
		1,
		null,
		undefined,
		window,
		anotherRealm
	];

	nodes.forEach(node => expect(isDetachedNode(node)).to.be.false);
}));



it("returns true for a DocumentFragment", runInBrowser(() =>
{
	const fragment = document.createDocumentFragment();
	expect(isDetachedNode(fragment)).to.be.true;
}));



it("supports same- and cross-Realm Document Nodes", runInBrowser(() =>
{
	const anotherDocument = anotherRealm.document;

	const tests =
	[
		{
			node: document,
			result: false
		},
		{
			node: document.implementation.createDocument("namespaceURI", "qualifiedNameStr"),
			result: true
		},
		{
			node: document.implementation.createHTMLDocument("title"),
			result: true
		},
		{
			node: anotherDocument,
			result: false
		},
		{
			node: anotherDocument.implementation.createDocument("namespaceURI", "qualifiedNameStr"),
			result: true
		},
		{
			node: anotherDocument.implementation.createHTMLDocument("title"),
			result: true
		}
	];

	tests.forEach(({node, result}) => expect(isDetachedNode(node)).to.equal(result));
}));



it("supports same- and cross-Realm Nodes", runInBrowser(() =>
{
	const anotherDocument = anotherRealm.document;

	const tests =
	[
		// Same Realm
		{
			node: document.createComment("data"),
			target: document.body
		},
		{
			node: document.createElement("tagName"),
			target: document.body
		},
		{
			node: document.createProcessingInstruction("target", "data"),
			target: document.body
		},
		{
			node: document.createTextNode("data"),
			target: document.body
		},
		{
			node: anotherDocument.createComment("data"),
			target: anotherDocument.body
		},
		{
			node: anotherDocument.createElement("tagName"),
			target: anotherDocument.body
		},
		{
			node: anotherDocument.createProcessingInstruction("target", "data"),
			target: anotherDocument.body
		},
		{
			node: anotherDocument.createTextNode("data"),
			target: anotherDocument.body
		},

		// Mixed Realms
		{
			node: document.createComment("data"),
			target: anotherDocument.body
		},
		{
			node: document.createElement("tagName"),
			target: anotherDocument.body
		},
		{
			node: document.createProcessingInstruction("target", "data"),
			target: anotherDocument.body
		},
		{
			node: document.createTextNode("data"),
			target: anotherDocument.body
		},
		{
			node: anotherDocument.createComment("data"),
			target: document.body
		},
		{
			node: anotherDocument.createElement("tagName"),
			target: document.body
		},
		{
			node: anotherDocument.createProcessingInstruction("target", "data"),
			target: document.body
		},
		{
			node: anotherDocument.createTextNode("data"),
			target: document.body
		}
	];

	tests.forEach(({node, target}) =>
	{
		expect(isDetachedNode(node)).to.be.true;

		target.append(node);

		expect(isDetachedNode(node)).to.be.false;

		node.remove();
	});
}));



it("supports seldom-used elements", runInBrowser(() =>
{
	const nodes =
	[
		document.implementation.createDocument("namespaceURI", "qualifiedNameStr").createCDATASection("data"),
		document.implementation.createDocumentType("qualifiedNameStr", "publicId", "systemId")
	];

	nodes.forEach(node => expect(isDetachedNode(node)).to.be.true);
}));



it("supports Nodes inside a DocumentFragment", runInBrowser(() =>
{
	const fragment = document.createDocumentFragment();
	const parent = document.createElement("div");
	const target = document.createTextNode("content");

	expect(isDetachedNode(target)).to.be.true;

	parent.append(target);
	fragment.append(parent);

	expect(isDetachedNode(target)).to.be.true;

	document.body.appendChild(fragment);

	expect(isDetachedNode(target)).to.be.false;

	parent.remove();
}));



it("supports Nodes inside <body>", runInBrowser(() =>
{
	const parent = document.createElement("div");
	const target = document.createTextNode("content");

	expect(isDetachedNode(target)).to.be.true;

	parent.append(target);
	document.body.append(parent);

	expect(isDetachedNode(target)).to.be.false;

	parent.remove();
}));



it("supports Nodes outside <body>", runInBrowser(() =>
{
	const parent = document.createElement("div");
	const target = document.createTextNode("content");

	expect(isDetachedNode(target)).to.be.true;

	parent.append(target);
	document.head.append(parent);

	expect(isDetachedNode(target)).to.be.false;

	parent.remove();
}));
