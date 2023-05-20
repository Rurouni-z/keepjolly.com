// https://0x3f.org/posts/how-to-write-blog-with-obsidian/
module.exports = async (params) => {
    const {app, quickAddApi: {suggester}} = params;
    const allTags = Object.keys(app.metadataCache.getTags());
    var newArr = allTags.map(str => str.replace("#", ""));
    console.log(newArr);

    QuickAdd = params;

    const title = await QuickAdd.quickAddApi.inputPrompt("Blog - Title");
    var slug = await QuickAdd.quickAddApi.inputPrompt("Blog - Slug");
    const category = await QuickAdd.quickAddApi.checkboxPrompt(newArr);

    if (typeof slug === 'undefined') {
        slug = title;
    }

    QuickAdd.variables["articleTitle"] = title;
    QuickAdd.variables["articleSlug"] = slug;
    QuickAdd.variables["articleFilename"] = slug.toLowerCase().replace(/[^A-Za-z0-9\s]/g, '').replace(/\s+/g, '-');
    QuickAdd.variables["articleCategory"] = category;
    QuickAdd.variables["articleTimestamp"] = QuickAdd.quickAddApi.date.now('YYYY-MM-DDTHH:mm:ssZ');

    console.log(QuickAdd.variables);
};