import {describe,expect,it} from "vitest";
import {addAsset,addClip,createEmptyProject,removeClip,splitClip} from "./index";

describe("timeline core",()=>{
 it("creates a new project with video and audio tracks",()=>{
  const project=createEmptyProject("Test Project");
  expect(project.name).toBe("Test Project");
  expect(project.tracks.map(track=>track.kind)).toEqual(["video","audio"]);
 });
 it("adds a media asset and timeline clip using integer frames",()=>{
  const project=createEmptyProject();
  const videoTrack=project.tracks[0]!;
  const asset={id:"asset-1",name:"sample.mp4",kind:"video" as const,sourceUrl:"blob:test",durationFrames:300};
  const next=addClip(addAsset(project,asset),videoTrack.id,asset.id,45);
  expect(next.tracks[0]!.clips[0]).toMatchObject({assetId:"asset-1",startFrame:45,durationFrames:300});
 });
 it("splits a clip at a frame boundary while preserving source continuity",()=>{
  const project=createEmptyProject();
  const asset={id:"asset-1",name:"sample.mp4",kind:"video" as const,sourceUrl:"blob:test",durationFrames:300};
  const placed=addClip(addAsset(project,asset),project.tracks[0]!.id,asset.id,30);
  const clipId=placed.tracks[0]!.clips[0]!.id;
  const split=splitClip(placed,clipId,130);
  expect(split.tracks[0]!.clips).toHaveLength(2);
  expect(split.tracks[0]!.clips[0]).toMatchObject({startFrame:30,sourceInFrame:0,durationFrames:100});
  expect(split.tracks[0]!.clips[1]).toMatchObject({startFrame:130,sourceInFrame:100,durationFrames:200});
 });
 it("rejects split positions outside a clip",()=>{
  const project=createEmptyProject();
  const asset={id:"asset-1",name:"sample.mp4",kind:"video" as const,sourceUrl:"blob:test",durationFrames:300};
  const placed=addClip(addAsset(project,asset),project.tracks[0]!.id,asset.id,30);
  const clipId=placed.tracks[0]!.clips[0]!.id;
  expect(()=>splitClip(placed,clipId,30)).toThrow("Split point must be inside the clip.");
 });
 it("removes a clip without changing the source asset bin",()=>{
  const project=createEmptyProject();
  const asset={id:"asset-1",name:"sample.mp4",kind:"video" as const,sourceUrl:"blob:test",durationFrames:300};
  const placed=addClip(addAsset(project,asset),project.tracks[0]!.id,asset.id,0);
  const clipId=placed.tracks[0]!.clips[0]!.id;
  const next=removeClip(placed,clipId);
  expect(next.tracks[0]!.clips).toHaveLength(0);
  expect(next.assets).toHaveLength(1);
 });
});
