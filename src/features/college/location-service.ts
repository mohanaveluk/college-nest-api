import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { College } from "./entities/college.entity";
import { District } from "./entities/district.entity";
import { State } from "./entities/state.entity";
import { Course } from "../course/entities/course.entity";

// location.service.ts
@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(College)
    private cityRepository: Repository<College>,
    @InjectRepository(District)
    private districtRepository: Repository<District>,
    @InjectRepository(State)
    private stateRepository: Repository<State>
  ) {}

  async isKnownLocation(term: string): Promise<boolean> {
    const [city, district, state] = await Promise.all([
      this.cityRepository.findOne({ where: { name: ILike(term) } }),
      this.districtRepository.findOne({ where: { name: ILike(term) } }),
      this.stateRepository.findOne({ where: { name: ILike(term) } })
    ]);
    return !!city || !!district || !!state;
  }
}

// course.service.ts
@Injectable()
export class CourseSearchService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>
  ) {}

  async courseNameExists(term: string): Promise<boolean> {
    return this.courseRepository.exist({ 
      where: { name: ILike(`%${term}%`) } 
    });
  }
}