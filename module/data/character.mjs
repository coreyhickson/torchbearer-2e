import TorchbearerActorBase from "./actor-base.mjs";

export default class TorchbearerCharacter extends TorchbearerActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(Object.keys(CONFIG.TORCHBEARER.abilities).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        label: new fields.StringField({ required: true, blank: true })
      });
      return obj;
    }, {}));

    // These are the Torchbearer fields
    // Who you are
    // Stock, class, age, home, raiment, parents, mentor, friend, enemy, level
    // Name is part of the base TypeDataModel fields
    schema.whoYouAre = new fields.SchemaField({
      stock: new fields.StringField({ blank: true, trim: true }),
      class: new fields.StringField({ blank: true, trim: true }),
      age: new fields.NumberField({ min: 0, integer: true, positive: true }),
      home: new fields.StringField({ blank: true, trim: true }),
      raiment: new fields.StringField({ blank: true, trim: true }),
      parents: new fields.StringField({ blank: true, trim: true }),
      mentor: new fields.StringField({ blank: true, trim: true }),
      friend: new fields.StringField({ blank: true, trim: true }),
      enemy: new fields.StringField({ blank: true, trim: true }),
      level: new fields.NumberField({ min: 0, integer: true, positive: true }),
    });

    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor((this.abilities[key].value - 10) / 2);
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.TORCHBEARER.abilities[key]) ?? key;
    }
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data
  }
}